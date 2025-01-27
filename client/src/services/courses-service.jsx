import axios from "axios";
const API_URL = "http://localhost:8080/api/course";

class CourseService {
  // Get the user's token from localStorage
  getToken() {
    const user = localStorage.getItem("user");
    if (user) {
      return JSON.parse(user).token;
    }
    return "";
  }

  //新增課程
  post(title, description, price) {
    return axios.post(
      API_URL,
      { title, description, price },
      {
        headers: {
          Authorization: this.getToken(),
        },
      }
    );
  }

  // 使用student id，來找到學生註冊的課程
  getEnrolledCourses(_id) {
    return axios.get(API_URL + "/student/" + _id, {
      headers: {
        Authorization: this.getToken(),
      },
    });
  }

  // 使用instructor id，來找到講師擁有的課程
  get(_id) {
    return axios.get(API_URL + "/instructor/" + _id, {
      headers: {
        Authorization: this.getToken(),
      },
    });
  }

  // 根據課程名稱查找課程
  getCourseByName(name) {
    return axios.get(API_URL + "/findByName/" + name, {
      headers: {
        Authorization: this.getToken(),
      },
    });
  }

  // 註冊課程
  enroll(_id) {
    return axios.post(
      API_URL + "/enroll/" + _id,
      {},
      {
        headers: {
          Authorization: this.getToken(),
        },
      }
    );
  }
}

export default new CourseService();
