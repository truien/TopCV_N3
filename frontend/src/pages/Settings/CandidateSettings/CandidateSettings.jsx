/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Badge,
  Modal,
} from "react-bootstrap";
import { toast } from "react-toastify";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendar,
  FaFileAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSave,
  FaUpload,
  FaCamera,
  FaEdit,
} from "react-icons/fa";
import styles from "./CandidateSettings.module.css";
import { useAuth } from "../../../contexts/AuthContext";
import axiosInstance from "../../../api/axiosInstance";
import Header from "@/components/Header/Header";

const CandidateSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  }); // Profile form data
  const [profileData, setProfileData] = useState({
    fullName: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    email: "",
    username: "",
  });

  // Password form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [currentCvFile, setCurrentCvFile] = useState(null); // Thêm state để lưu thông tin CV hiện tại

  useEffect(() => {
    loadProfile();
  }, []);
  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/user/profile");
      setProfileData(response.data);
      setAvatarPreview(response.data.avatar || "");

      // Kiểm tra và lấy thông tin CV
      const cvResponse = await axiosInstance.get("/api/user/cv");
      if (cvResponse.data.hasCv) {
        setCurrentCvFile(cvResponse.data.cvFile);
      } else {
        setCurrentCvFile(null);
      }
    } catch (error) {
      toast.error("Lỗi khi tải thông tin profile");
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(profileData).forEach((key) => {
        formData.append(key, profileData[key]);
      });

      if (avatar) {
        formData.append("avatar", avatar);
      }

      if (cvFile) {
        formData.append("cv", cvFile);
      }

      const response = await axiosInstance.put(
        "/api/user/update-profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Cập nhật thông tin thành công!");
      loadProfile();
    } catch (error) {
      toast.error("Lỗi khi cập nhật thông tin");
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.put("/api/user/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Đổi mật khẩu thành công!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordModal(false);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Lỗi khi đổi mật khẩu";
      toast.error(errorMessage);
      console.error("Error changing password:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCvChange = (e) => {
    const file = e.target.files[0];
    setCvFile(file);
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (loading && !profileData.email) {
    return (
      <Container className={styles.container}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Đang tải thông tin...</p>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Header />
      <Container className={styles.container}>
        <Row>
          <Col md={12}>
            <div className={styles.header}>
              <h1 className={styles.title}>
                <FaUser className="me-2" />
                Cài đặt tài khoản ứng viên
              </h1>
              <p className={styles.subtitle}>
                Quản lý thông tin cá nhân và cài đặt bảo mật của bạn
              </p>
            </div>
          </Col>
        </Row>

        <Row>
          {/* Profile Settings */}
          <Col lg={8}>
            <Card className={styles.settingsCard}>
              <Card.Header className={styles.cardHeader}>
                <h4>
                  <FaEdit className="me-2" />
                  Thông tin cá nhân
                </h4>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleProfileSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className={styles.formLabel}>
                          <FaUser className="me-2" />
                          Họ và tên
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={profileData.fullName || ""}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              fullName: e.target.value,
                            })
                          }
                          className={styles.formControl}
                          placeholder="Nhập họ và tên"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className={styles.formLabel}>
                          <FaEnvelope className="me-2" />
                          Email
                        </Form.Label>
                        <Form.Control
                          type="email"
                          value={profileData.email || ""}
                          disabled
                          className={styles.formControl}
                        />
                        <Form.Text className="text-muted">
                          Email không thể thay đổi
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className={styles.formLabel}>
                          <FaPhone className="me-2" />
                          Số điện thoại
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          value={profileData.phone || ""}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              phone: e.target.value,
                            })
                          }
                          className={styles.formControl}
                          placeholder="Nhập số điện thoại"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className={styles.formLabel}>
                          <FaCalendar className="me-2" />
                          Ngày sinh
                        </Form.Label>
                        <Form.Control
                          type="date"
                          value={profileData.dateOfBirth || ""}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              dateOfBirth: e.target.value,
                            })
                          }
                          className={styles.formControl}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label className={styles.formLabel}>
                      <FaMapMarkerAlt className="me-2" />
                      Địa chỉ
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={profileData.address || ""}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          address: e.target.value,
                        })
                      }
                      className={styles.formControl}
                      placeholder="Nhập địa chỉ"
                    />
                  </Form.Group>{" "}
                  <Form.Group className="mb-4">
                    <Form.Label className={styles.formLabel}>
                      <FaFileAlt className="me-2" />
                      CV của bạn
                    </Form.Label>

                    {currentCvFile && (
                      <div className="mb-3 p-2 border rounded d-flex justify-content-between align-items-center">
                        {" "}
                        <div>
                          <FaFileAlt className="me-2 text-primary" />
                          {currentCvFile.split("/").pop()}
                        </div>
                        <div>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="me-2"
                            onClick={() => {
                              // Kiểm tra dữ liệu CV và log cho debug
                              console.log("CV File Path:", currentCvFile);
                              const baseUrl =
                                import.meta.env.VITE_API_URL || "";

                              // Tạo URL đầy đủ
                              const cvUrl = currentCvFile.includes("http")
                                ? currentCvFile
                                : `${baseUrl}/uploads/cvs/${currentCvFile}`;
                              console.log("Opening CV at URL:", cvUrl);

                              // Tạo một thẻ a ẩn và kích hoạt click
                              const link = document.createElement("a");
                              link.href = cvUrl;
                              link.target = "_blank";
                              link.rel = "noopener noreferrer";
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);

                              setTimeout(() => {
                                toast.info(
                                  "Nếu CV không mở, vui lòng kiểm tra cài đặt trình duyệt và thử lại"
                                );
                              }, 1000);
                            }}
                          >
                            Xem CV
                          </Button>
                        </div>
                      </div>
                    )}

                    <Form.Control
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleCvChange}
                      className={styles.formControl}
                    />
                    <Form.Text className="text-muted">
                      {currentCvFile
                        ? "Tải lên file mới để cập nhật CV của bạn"
                        : "Chỉ chấp nhận file PDF, DOC, DOCX (tối đa 5MB)"}
                    </Form.Text>
                  </Form.Group>
                  <div className="d-flex justify-content-end">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading}
                      className={styles.saveButton}
                    >
                      {loading ? (
                        <Spinner size="sm" className="me-2" />
                      ) : (
                        <FaSave className="me-2" />
                      )}
                      Lưu thay đổi
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            {/* Avatar Section */}
            <Card className={styles.settingsCard}>
              <Card.Header className={styles.cardHeader}>
                <h5>
                  <FaCamera className="me-2" />
                  Ảnh đại diện
                </h5>
              </Card.Header>
              <Card.Body className="text-center">
                <div className={styles.avatarContainer}>
                  <img
                    src={
                      avatarPreview || "/src/assets/images/avatar-default.jpg"
                    }
                    alt="Avatar"
                    className={styles.avatarImage}
                  />
                  <div className={styles.avatarOverlay}>
                    <FaCamera />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className={styles.avatarInput}
                  />
                </div>
                <p className="text-muted mt-2">
                  Click để thay đổi ảnh đại diện
                </p>
              </Card.Body>
            </Card>

            {/* Security Section */}
            <Card className={styles.settingsCard}>
              <Card.Header className={styles.cardHeader}>
                <h5>
                  <FaLock className="me-2" />
                  Bảo mật
                </h5>
              </Card.Header>
              <Card.Body>
                <Button
                  variant="outline-primary"
                  onClick={() => setShowPasswordModal(true)}
                  className="w-100 mb-3"
                >
                  <FaLock className="me-2" />
                  Đổi mật khẩu
                </Button>

                <div className={styles.securityInfo}>
                  <Badge bg="success" className="mb-2">
                    Tài khoản đã được xác thực
                  </Badge>
                  <p className="text-muted small">
                    Tài khoản của bạn được bảo vệ với các biện pháp bảo mật tiên
                    tiến
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Change Password Modal */}
        <Modal
          show={showPasswordModal}
          onHide={() => setShowPasswordModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaLock className="me-2" />
              Đổi mật khẩu
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handlePasswordSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu hiện tại</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPassword.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                  />
                  <Button
                    variant="link"
                    className={styles.passwordToggle}
                    onClick={() => togglePasswordVisibility("current")}
                  >
                    {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu mới</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPassword.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    required
                    minLength={6}
                  />
                  <Button
                    variant="link"
                    className={styles.passwordToggle}
                    onClick={() => togglePasswordVisibility("new")}
                  >
                    {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPassword.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                  <Button
                    variant="link"
                    className={styles.passwordToggle}
                    onClick={() => togglePasswordVisibility("confirm")}
                  >
                    {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </div>
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Hủy
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? <Spinner size="sm" className="me-2" /> : null}
                  Đổi mật khẩu
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
};

export default CandidateSettings;
