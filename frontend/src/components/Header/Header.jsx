import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/topcv-logo-10-year.png";
import avatarDefault from "../../assets/images/avatar-default.jpg";
import { useState, useEffect, useRef } from "react";
import styles from "./Header.module.css";
import { getUserProfile } from "../../api/userApi";
import { logout } from "../../api/authApi";
import NotificationDropdown from "../NotificationDropdown";
// eslint-disable-next-line no-unused-vars
import { useNotificationContext } from "../../contexts/notification-context.js";

const Header = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserProfile();
        setUserInfo(data);
      } catch (err) {
        if (err.response?.status === 401) {
          console.warn("Chưa đăng nhập");
          setUserInfo(null);
        } else {
          console.error("Lỗi lấy thông tin user:", err);
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout(); // gọi API logout
      setUserInfo(null);
      navigate("/");
    } catch (err) {
      console.error("Lỗi khi đăng xuất:", err);
    }
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const handleLogin = () => navigate("/login");
  const handleRegister = () => navigate("/sign");

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-light px-3 ${styles.navbar}`}
      role="navigation"
    >
      <div className="container-fluid">
        <span className="navbar-brand">
          <img src={logo} alt="Logo" className={styles.navbarBrandImg} />
        </span>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className="collapse navbar-collapse d-flex justify-content-between"
          id="navbarNav"
        >
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link
                to="/"
                className={`nav-link ${styles.navLinkCustom} ${styles.customText}`}
              >
                Trang chủ
              </Link>
            </li>{" "}
            <li className="nav-item">
              <Link
                to="/search-job"
                className={`nav-link ${styles.navLinkCustom} ${styles.customText}`}
              >
                Tìm việc
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/employers"
                className={`nav-link ${styles.navLinkCustom} ${styles.customText}`}
              >
                Nhà tuyển dụng
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/create-cv"
                className={`nav-link ${styles.navLinkCustom} ${styles.customText}`}
              >
                Tạo CV
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/resources"
                className={`nav-link ${styles.navLinkCustom} ${styles.customText}`}
              >
                Tài nguyên
              </Link>
            </li>
            {userInfo?.role === "admin" && (
              <li className="nav-item">
                <Link
                  to="/admin"
                  className={`nav-link ${styles.navLinkCustom} ${styles.customText}`}
                >
                  Quản lý
                </Link>
              </li>
            )}
            {userInfo?.role === "employer" && (
              <li className="nav-item">
                <Link
                  to="/employer"
                  className={`nav-link ${styles.navLinkCustom} ${styles.customText}`}
                >
                  Quản lý
                </Link>
              </li>
            )}
          </ul>
          <div className="d-none d-lg-flex align-items-center gap-3 position-relative">
            {userInfo ? (
              <>
                {/* Thêm Notification Dropdown */}
                <NotificationDropdown />

                <div
                  className={`dropdown ${styles.userDropdown}`}
                  ref={dropdownRef}
                >
                  <button
                    className="btn btn-light dropdown-toggle d-flex align-items-center gap-2"
                    type="button"
                    onClick={toggleDropdown}
                  >
                    <span>{userInfo.fullName || userInfo.username}</span>
                    <img
                      src={userInfo.avatar || avatarDefault}
                      alt="Avatar"
                      className={styles.avatar}
                    />
                  </button>{" "}
                  {showDropdown && (
                    <div
                      className={`dropdown-menu show ${styles.dropdownMenu}`}
                    >
                      {userInfo.role === "candidate" && (
                        <Link
                          to="/candidate/settings"
                          className="dropdown-item"
                        >
                          Cài đặt tài khoản
                        </Link>
                      )}
                      {userInfo.role === "employer" && (
                        <Link to="/employer/settings" className="dropdown-item">
                          Cài đặt tài khoản
                        </Link>
                      )}
                      {(userInfo.role === "user" || !userInfo.role) && (
                        <Link to="/user/settings" className="dropdown-item">
                          Cài đặt tài khoản
                        </Link>
                      )}{" "}
                      <Link to="/notifications" className="dropdown-item">
                        Thông báo
                      </Link>
                      {userInfo.role === "candidate" && (
                        <Link to="/saved-jobs" className="dropdown-item">
                          Công việc đã lưu
                        </Link>
                      )}
                      <button onClick={handleLogout} className="dropdown-item">
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className={`btn btn-outline-custom me-2 ${styles.btnOutlineCustom}`}
                >
                  Đăng nhập
                </button>
                <button
                  onClick={handleRegister}
                  className={`btn btn-primary-custom ${styles.btnPrimaryCustom}`}
                >
                  Đăng ký
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
