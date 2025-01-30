const router = require("express").Router();
const Course = require("../models").course;
const courseValidation = require("../validation").courseValidation;

// router.use((req, res, next) => {
//   console.log("Course route正在接收一個Request....");
//   next();
// });

//獲得系統中的所有課程
router.get("/", async (req, res) => {
  try {
    let courseFound = await Course.find({})
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(courseFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// 用講師ID來尋找課程
router.get("/instructor/:_instructor_id", async (req, res) => {
  let { _instructor_id } = req.params;
  let coursesFound = await Course.find({ instructor: _instructor_id })
    .populate("instructor", ["username", "email"])
    .exec();
  return res.send(coursesFound);
});

// 用學生ID來尋找課程
router.get("/student/:_student_id", async (req, res) => {
  let { _student_id } = req.params;
  let coursesFound = await Course.find({ students: _student_id })
    .populate("instructor", ["username", "email"])
    .exec();
  return res.send(coursesFound);
});

// 用課程名稱來尋找課程
router.get("/findByName/:name", async (req, res) => {
  let { name } = req.params;
  try {
    let courseFound = await Course.find({
      title: { $regex: name, $options: "i" },
    }) // 模糊匹配&忽略大小寫
      .populate("instructor", ["email", "username"])
      .exec();
    return res.send(courseFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//用課程ID尋找課程
router.get("/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let courseFound = await Course.findOne({ _id })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(courseFound);
  } catch (e) {
    if (e.name === "CastError") {
      return res.status(400).send("無效的課程 ID 格式。");
    }
    return res.status(500).send(e);
  }
});

//新增課程
router.post("/", async (req, res) => {
  //驗證數據符合規範
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.user.isStudent()) {
    return res
      .status(400)
      .send("只有講師才能發佈新課程。若你已經是講師，請透過講師帳號登入。");
  }

  let { title, description, price } = req.body;
  try {
    let newCourse = new Course({
      title,
      description,
      price,
      instructor: req.user._id,
    });
    let savedCourse = await newCourse.save();
    return res.send("新課程已經保存");
  } catch (e) {
    return res.status(500).send("無法創建課程...");
  }
});

//讓學生透過ID來註冊新課程
router.post("/enroll/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let courseFound = await Course.findOne({ _id }).exec();
    courseFound.students.push(req.user._id);
    await courseFound.save();
    return res.send("註冊完成");
  } catch (e) {
    return res.send(e);
  }
});

// 更改課程
router.patch("/:_id", async (req, res) => {
  // 驗證數據符合規範
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let { _id } = req.params;
  // 確認課程存在
  try {
    let courseFound = await Course.findOne({ _id });
    if (!courseFound) {
      return res.status(400).send("找不到課程。無法更新課程內容。");
    }

    // 使用者必須是此課程講師，才能編輯課程
    if (courseFound.instructor.equals(req.user._id)) {
      let updatedCourse = await Course.findOneAndUpdate({ _id }, req.body, {
        new: true,
        runValidators: true,
      });
      return res.send({
        message: "課程已經被更新成功",
        updatedCourse,
      });
    } else {
      return res.status(403).send("只有此課程的講師才能編輯課程。");
    }
  } catch (e) {
    if (e.name === "CastError") {
      return res.status(400).send("無效的課程 ID 格式。");
    }
    return res.status(500).send(e);
  }
});

//刪除課程
router.delete("/:_id", async (req, res) => {
  try {
    // 確認課程是否存在
    let courseFound = await Course.findOne({ _id: req.params._id }).exec();
    if (!courseFound) {
      return res.status(400).send("找不到課程。無法刪除課程。");
    }

    // 使用者必須是此課程講師才能刪除課程
    if (courseFound.instructor.equals(req.user._id)) {
      await Course.deleteOne({ _id: req.params._id }).exec();
      return res.send({ message: "課程已經成功刪除。" });
    } else {
      return res.status(403).send("只有此課程的講師才能刪除課程。");
    }
  } catch (e) {
    if (e.name === "CastError") {
      return res.status(400).send("無效的課程 ID 格式。");
    }
    return res.status(500).send(e);
  }
});

module.exports = router;
