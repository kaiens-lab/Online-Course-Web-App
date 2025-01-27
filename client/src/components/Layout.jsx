import { Outlet } from "react-router-dom";
import Nav from "./nav-component";
import PropTypes from "prop-types";

const Layout = ({ currentUser, setCurrentUser }) => {
  return (
    <>
      <Nav currentUser={currentUser} setCurrentUser={setCurrentUser} />
      <Outlet />
    </>
  );
};

export default Layout;

Layout.propTypes = {
  currentUser: PropTypes.object,
  setCurrentUser: PropTypes.func,
};
