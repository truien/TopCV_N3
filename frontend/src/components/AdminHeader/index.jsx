import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaBars,
  FaBell,
  FaUser,
  FaChartLine,
  FaBriefcase,
  FaCog,
  FaHome,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaTags,
  FaClock,
} from "react-icons/fa";
import logo from "../../assets/images/logo-birthday-10.09ebdc6.png";
import "./styles.css";

const AdminHeaderSidebar = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeLink, setActiveLink] = useState(
    sessionStorage.getItem("activeLink") || "/admin"
  );

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
    sessionStorage.setItem("sidebarCollapsed", !isSidebarCollapsed);
  };

  const handleLinkClick = (link) => {
    setActiveLink(link);
    sessionStorage.setItem("activeLink", link);
  };

  useEffect(() => {
    const savedSidebarState = sessionStorage.getItem("sidebarCollapsed");
    if (savedSidebarState === "true") {
      setIsSidebarCollapsed(true);
    }
  }, []);

  return (
    <div className={`admin-layout d-flex`}>
      {/* Header */}
      <header className="header navbar navbar-expand-lg navbar-dark fixed-top">
        <button className="btn text-white me-2" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img src={logo} alt="Logo" height="40" className="me-2" />
        </Link>
        <div className="header-icons d-flex align-items-center">
          <button className="bg-transparent border-0">
            <FaBell className="text-white mx-2" />
          </button>
          <button className="bg-transparent border-0">
            <FaUser className="text-white mx-2" />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <nav className="nav flex-column pt-4">
          <Link
            to="/admin"
            className={`nav-link ${activeLink === "/admin" ? "active" : ""}`}
            onClick={() => handleLinkClick("/admin")}
          >
            <FaChartLine className="icon" />
            <span className="link-text fw-bolder">Quản lý tài khoản</span>
          </Link>
          <Link
            to="/admin/job-posts"
            className={`nav-link ${
              activeLink === "/admin/job-posts" ? "active" : ""
            }`}
            onClick={() => handleLinkClick("/admin/job-posts")}
          >
            <FaBriefcase className="icon" />
            <span className="link-text fw-bolder">Quản lý bài viết</span>
          </Link>
          <Link
            to="/admin/job-post-pakage"
            className={`nav-link ${
              activeLink === "/admin/job-post-pakage" ? "active" : ""
            }`}
            onClick={() => handleLinkClick("/admin/job-post-pakage")}
          >
            <FaBriefcase className="icon" />
            <span className="link-text fw-bolder">Quản lý gói bài viết</span>
          </Link>{" "}
          <Link
            to="/admin/pro-packages"
            className={`nav-link ${
              activeLink === "/admin/pro-packages" ? "active" : ""
            }`}
            onClick={() => handleLinkClick("/admin/pro-packages")}
          >
            <FaBriefcase className="icon" />
            <span className="link-text fw-bolder">Quản lý gói Pro</span>
          </Link>{" "}
          <Link
            to="/admin/revenue"
            className={`nav-link ${
              activeLink === "/admin/revenue" ? "active" : ""
            }`}
            onClick={() => handleLinkClick("/admin/revenue")}
          >
            <FaMoneyBillWave className="icon" />
            <span className="link-text fw-bolder">Quản lý doanh thu</span>
          </Link>{" "}
          <Link
            to="/admin/reports"
            className={`nav-link ${
              activeLink === "/admin/reports" ? "active" : ""
            }`}
            onClick={() => handleLinkClick("/admin/reports")}
          >
            <FaExclamationTriangle className="icon" />
            <span className="link-text fw-bolder">Quản lý báo cáo</span>
          </Link>
          <Link
            to="/admin/job-fields"
            className={`nav-link ${
              activeLink === "/admin/job-fields" ? "active" : ""
            }`}
            onClick={() => handleLinkClick("/admin/job-fields")}
          >
            <FaTags className="icon" />
            <span className="link-text fw-bolder">Quản lý lĩnh vực</span>
          </Link>
          <Link
            to="/admin/employment-types"
            className={`nav-link ${
              activeLink === "/admin/employment-types" ? "active" : ""
            }`}
            onClick={() => handleLinkClick("/admin/employment-types")}
          >
            <FaClock className="icon" />
            <span className="link-text fw-bolder">
              Quản lý hình thức làm việc
            </span>
          </Link>
          <Link to="/" className="nav-link">
            <FaHome className="icon" />
            <span className="link-text fw-bolder">Về trang chủ</span>
          </Link>
        </nav>
      </aside>
    </div>
  );
};

export default AdminHeaderSidebar;
