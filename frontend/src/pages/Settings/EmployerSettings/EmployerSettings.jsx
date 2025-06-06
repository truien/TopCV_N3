/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge, Modal, Tabs, Tab } from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
    FaBuilding, FaEnvelope, FaMapMarkerAlt, FaGlobe, FaFileAlt,
    FaLock, FaEye, FaEyeSlash, FaSave, FaUpload, FaCamera, FaEdit,
    FaCrown, FaChartBar, FaCog, FaBell
} from 'react-icons/fa';
import styles from './EmployerSettings.module.css';
import { useAuth } from '../../../contexts/AuthContext';
import axiosInstance from '../../../api/axiosInstance';
import RichTextEditor from '../../../components/RichTextEditor/RichTextEditor';

const EmployerSettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });    // Company profile data
    const [companyData, setCompanyData] = useState({
        companyName: '',
        description: '',
        website: '',
        location: '',
        email: '',
        username: ''
    });

    // Password form data
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Notification settings
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        applicationNotifications: true,
        interviewNotifications: true,
        marketingEmails: false
    });

    // Pro subscription info
    const [proInfo, setProInfo] = useState(null);

    // Logo
    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');

    // Load company profile data
    useEffect(() => {
        loadProfile();
        loadProSubscription();
    }, []); const loadProfile = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/user/profile');
            setCompanyData(response.data);
            setLogoPreview(response.data.avatar || '');
        } catch (error) {
            toast.error('Lỗi khi tải thông tin công ty');
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    }; const loadProSubscription = async () => {
        try {
            const response = await axiosInstance.get('/api/user/pro-subscription');
            setProInfo(response.data);
        } catch (error) {
            console.error('Error loading pro subscription:', error);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            Object.keys(companyData).forEach(key => {
                formData.append(key, companyData[key]);
            }); if (logo) {
                formData.append('avatar', logo);
            } const response = await axiosInstance.put('/api/user/update-profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Cập nhật thông tin công ty thành công!');
            loadProfile();
        } catch (error) {
            toast.error('Lỗi khi cập nhật thông tin công ty');
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Mật khẩu mới không khớp!');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
            return;
        } setLoading(true);
        try {
            const response = await axiosInstance.put('/api/user/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            toast.success('Đổi mật khẩu thành công!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordModal(false);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Lỗi khi đổi mật khẩu';
            toast.error(errorMessage);
            console.error('Error changing password:', error);
        } finally {
            setLoading(false);
        }
    }; const handleNotificationUpdate = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.put('/api/user/notification-settings', notificationSettings);
            toast.success('Cập nhật cài đặt thông báo thành công!');
        } catch (error) {
            toast.error('Lỗi khi cập nhật cài đặt thông báo');
            console.error('Error updating notification settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    if (loading && !companyData.email) {
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
        <Container className={styles.container}>
            <Row>
                <Col md={12}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>
                            <FaBuilding className="me-2" />
                            Cài đặt tài khoản nhà tuyển dụng
                        </h1>
                        <p className={styles.subtitle}>
                            Quản lý thông tin công ty và cài đặt tài khoản
                        </p>
                    </div>
                </Col>
            </Row>

            <Row>
                <Col lg={9}>
                    <Card className={styles.settingsCard}>
                        <Card.Body>
                            <Tabs
                                activeKey={activeTab}
                                onSelect={(k) => setActiveTab(k)}
                                className={styles.settingsTabs}
                            >
                                {/* Company Profile Tab */}
                                <Tab eventKey="profile" title={
                                    <span>
                                        <FaBuilding className="me-2" />
                                        Thông tin công ty
                                    </span>
                                }>
                                    <div className={styles.tabContent}>
                                        <Form onSubmit={handleProfileSubmit}>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className={styles.formLabel}>
                                                            <FaBuilding className="me-2" />
                                                            Tên công ty
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={companyData.companyName || ''}
                                                            onChange={(e) => setCompanyData({
                                                                ...companyData,
                                                                companyName: e.target.value
                                                            })}
                                                            className={styles.formControl}
                                                            placeholder="Nhập tên công ty"
                                                            required
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
                                                            value={companyData.email || ''}
                                                            disabled
                                                            className={styles.formControl}
                                                        />
                                                        <Form.Text className="text-muted">
                                                            Email không thể thay đổi
                                                        </Form.Text>
                                                    </Form.Group>
                                                </Col>
                                            </Row>                                            <Row>
                                                <Col md={12}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className={styles.formLabel}>
                                                            <FaGlobe className="me-2" />
                                                            Website
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="url"
                                                            value={companyData.website || ''}
                                                            onChange={(e) => setCompanyData({
                                                                ...companyData,
                                                                website: e.target.value
                                                            })}
                                                            className={styles.formControl}
                                                            placeholder="https://example.com"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Form.Group className="mb-3">
                                                <Form.Label className={styles.formLabel}>
                                                    <FaMapMarkerAlt className="me-2" />
                                                    Địa chỉ công ty
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={companyData.location || ''}
                                                    onChange={(e) => setCompanyData({
                                                        ...companyData,
                                                        location: e.target.value
                                                    })}
                                                    className={styles.formControl}
                                                    placeholder="Nhập địa chỉ công ty"
                                                />
                                            </Form.Group>                                            <Form.Group className="mb-4">
                                                <Form.Label className={styles.formLabel}>
                                                    <FaFileAlt className="me-2" />
                                                    Mô tả công ty
                                                </Form.Label>
                                                <RichTextEditor
                                                    value={companyData.description || ''}
                                                    onChange={(value) => setCompanyData({
                                                        ...companyData,
                                                        description: value
                                                    })}
                                                />
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
                                    </div>
                                </Tab>

                                {/* Notification Settings Tab */}
                                <Tab eventKey="notifications" title={
                                    <span>
                                        <FaBell className="me-2" />
                                        Thông báo
                                    </span>
                                }>
                                    <div className={styles.tabContent}>
                                        <h4 className="mb-4">Cài đặt thông báo</h4>

                                        <Form.Group className="mb-3">
                                            <Form.Check
                                                type="switch"
                                                id="email-notifications"
                                                label="Nhận thông báo qua email"
                                                checked={notificationSettings.emailNotifications}
                                                onChange={(e) => setNotificationSettings({
                                                    ...notificationSettings,
                                                    emailNotifications: e.target.checked
                                                })}
                                                className={styles.switchControl}
                                            />
                                            <Form.Text className="text-muted">
                                                Nhận thông báo quan trọng qua email
                                            </Form.Text>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Check
                                                type="switch"
                                                id="application-notifications"
                                                label="Thông báo đơn ứng tuyển mới"
                                                checked={notificationSettings.applicationNotifications}
                                                onChange={(e) => setNotificationSettings({
                                                    ...notificationSettings,
                                                    applicationNotifications: e.target.checked
                                                })}
                                                className={styles.switchControl}
                                            />
                                            <Form.Text className="text-muted">
                                                Thông báo khi có ứng viên mới ứng tuyển
                                            </Form.Text>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Check
                                                type="switch"
                                                id="interview-notifications"
                                                label="Thông báo phỏng vấn"
                                                checked={notificationSettings.interviewNotifications}
                                                onChange={(e) => setNotificationSettings({
                                                    ...notificationSettings,
                                                    interviewNotifications: e.target.checked
                                                })}
                                                className={styles.switchControl}
                                            />
                                            <Form.Text className="text-muted">
                                                Thông báo về lịch phỏng vấn và cập nhật
                                            </Form.Text>
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Check
                                                type="switch"
                                                id="marketing-emails"
                                                label="Email marketing"
                                                checked={notificationSettings.marketingEmails}
                                                onChange={(e) => setNotificationSettings({
                                                    ...notificationSettings,
                                                    marketingEmails: e.target.checked
                                                })}
                                                className={styles.switchControl}
                                            />
                                            <Form.Text className="text-muted">
                                                Nhận thông tin về tính năng mới và khuyến mãi
                                            </Form.Text>
                                        </Form.Group>

                                        <div className="d-flex justify-content-end">
                                            <Button
                                                variant="primary"
                                                onClick={handleNotificationUpdate}
                                                disabled={loading}
                                                className={styles.saveButton}
                                            >
                                                {loading ? (
                                                    <Spinner size="sm" className="me-2" />
                                                ) : (
                                                    <FaSave className="me-2" />
                                                )}
                                                Lưu cài đặt
                                            </Button>
                                        </div>
                                    </div>
                                </Tab>

                                {/* Security Tab */}
                                <Tab eventKey="security" title={
                                    <span>
                                        <FaLock className="me-2" />
                                        Bảo mật
                                    </span>
                                }>
                                    <div className={styles.tabContent}>
                                        <h4 className="mb-4">Bảo mật tài khoản</h4>

                                        <Card className={styles.securityCard}>
                                            <Card.Body>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h5>Mật khẩu</h5>
                                                        <p className="text-muted mb-0">
                                                            Thay đổi mật khẩu để bảo vệ tài khoản
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="outline-primary"
                                                        onClick={() => setShowPasswordModal(true)}
                                                    >
                                                        <FaLock className="me-2" />
                                                        Đổi mật khẩu
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>

                                        <Alert variant="success" className="mt-3">
                                            <FaLock className="me-2" />
                                            Tài khoản của bạn được bảo vệ với các biện pháp bảo mật tiên tiến
                                        </Alert>
                                    </div>
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Sidebar */}
                <Col lg={3}>
                    {/* Logo Section */}
                    <Card className={styles.settingsCard}>
                        <Card.Header className={styles.cardHeader}>
                            <h5>
                                <FaCamera className="me-2" />
                                Logo công ty
                            </h5>
                        </Card.Header>
                        <Card.Body className="text-center">
                            <div className={styles.logoContainer}>
                                <img
                                    src={logoPreview || '/src/assets/images/company-default.png'}
                                    alt="Company Logo"
                                    className={styles.logoImage}
                                />
                                <div className={styles.logoOverlay}>
                                    <FaCamera />
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className={styles.logoInput}
                                />
                            </div>
                            <p className="text-muted mt-2">
                                Click để thay đổi logo công ty
                            </p>
                        </Card.Body>
                    </Card>

                    {/* Pro Subscription */}
                    <Card className={styles.settingsCard}>
                        <Card.Header className={styles.cardHeader}>
                            <h5>
                                <FaCrown className="me-2" />
                                Gói Pro
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            {proInfo ? (
                                proInfo.isPro ? (
                                    <div>
                                        <Badge bg="warning" className="mb-2">
                                            <FaCrown className="me-1" />
                                            Tài khoản Pro
                                        </Badge>
                                        <p className="small text-muted">
                                            Hết hạn: {new Date(proInfo.endDate).toLocaleDateString('vi-VN')}
                                        </p>
                                        <p className="small">
                                            Số bài đăng còn lại: <strong>{proInfo.postsLeft}</strong>
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <Badge bg="secondary" className="mb-2">
                                            Tài khoản miễn phí
                                        </Badge>
                                        <p className="small">
                                            Số bài đăng còn lại: <strong>{proInfo.postsLeft}</strong>
                                        </p>
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            className="w-100"
                                        >
                                            <FaCrown className="me-1" />
                                            Nâng cấp Pro
                                        </Button>
                                    </div>
                                )
                            ) : (
                                <Spinner size="sm" />
                            )}
                        </Card.Body>
                    </Card>

                    {/* Stats */}
                    <Card className={styles.settingsCard}>
                        <Card.Header className={styles.cardHeader}>
                            <h5>
                                <FaChartBar className="me-2" />
                                Thống kê
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className={styles.statItem}>
                                <span className="text-muted">Tin đã đăng</span>
                                <strong>0</strong>
                            </div>
                            <div className={styles.statItem}>
                                <span className="text-muted">Ứng viên</span>
                                <strong>0</strong>
                            </div>
                            <div className={styles.statItem}>
                                <span className="text-muted">Phỏng vấn</span>
                                <strong>0</strong>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Change Password Modal */}
            <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
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
                                    onChange={(e) => setPasswordData({
                                        ...passwordData,
                                        currentPassword: e.target.value
                                    })}
                                    required
                                />
                                <Button
                                    variant="link"
                                    className={styles.passwordToggle}
                                    onClick={() => togglePasswordVisibility('current')}
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
                                    onChange={(e) => setPasswordData({
                                        ...passwordData,
                                        newPassword: e.target.value
                                    })}
                                    required
                                    minLength={6}
                                />
                                <Button
                                    variant="link"
                                    className={styles.passwordToggle}
                                    onClick={() => togglePasswordVisibility('new')}
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
                                    onChange={(e) => setPasswordData({
                                        ...passwordData,
                                        confirmPassword: e.target.value
                                    })}
                                    required
                                />
                                <Button
                                    variant="link"
                                    className={styles.passwordToggle}
                                    onClick={() => togglePasswordVisibility('confirm')}
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
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? <Spinner size="sm" className="me-2" /> : null}
                                Đổi mật khẩu
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default EmployerSettings;
