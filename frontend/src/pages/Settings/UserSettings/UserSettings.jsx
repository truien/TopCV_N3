/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge, Modal, Tabs, Tab } from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
    FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSave, FaCamera,
    FaEdit, FaBell, FaCog, FaShieldAlt, FaPalette, FaGlobe
} from 'react-icons/fa';
import styles from './UserSettings.module.css';
import { useAuth } from '../../../contexts/AuthContext';
import axiosInstance from '../../../api/axiosInstance';

const UserSettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // User profile data
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        displayName: ''
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
        jobAlerts: true,
        systemNotifications: true,
        marketingEmails: false
    });

    // Privacy settings
    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: 'public',
        searchVisibility: true,
        allowMessages: true
    });

    // Theme settings
    const [themeSettings, setThemeSettings] = useState({
        theme: 'light',
        language: 'vi'
    });

    // Avatar
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');

    // Load user profile data
    useEffect(() => {
        loadProfile();
    }, []); const loadProfile = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/user/profile');
            setUserData(response.data);
            setAvatarPreview(response.data.avatar || '');
        } catch (error) {
            toast.error('Lỗi khi tải thông tin người dùng');
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            Object.keys(userData).forEach(key => {
                formData.append(key, userData[key]);
            });

            if (avatar) {
                formData.append('avatar', avatar);
            } const response = await axiosInstance.put('/api/user/update-profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Cập nhật thông tin thành công!');
            loadProfile();
        } catch (error) {
            toast.error('Lỗi khi cập nhật thông tin');
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
    }; const handlePrivacyUpdate = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.put('/api/user/privacy-settings', privacySettings);
            toast.success('Cập nhật cài đặt riêng tư thành công!');
        } catch (error) {
            toast.error('Lỗi khi cập nhật cài đặt riêng tư');
            console.error('Error updating privacy settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleThemeUpdate = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.put('/api/user/theme-settings', themeSettings);
            toast.success('Cập nhật giao diện thành công!');
        } catch (error) {
            toast.error('Lỗi khi cập nhật giao diện');
            console.error('Error updating theme settings:', error);
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

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    if (loading && !userData.email) {
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
                            <FaUser className="me-2" />
                            Cài đặt tài khoản
                        </h1>
                        <p className={styles.subtitle}>
                            Quản lý thông tin cá nhân và tùy chỉnh trải nghiệm của bạn
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
                                {/* Profile Tab */}
                                <Tab eventKey="profile" title={
                                    <span>
                                        <FaUser className="me-2" />
                                        Thông tin cá nhân
                                    </span>
                                }>
                                    <div className={styles.tabContent}>
                                        <Form onSubmit={handleProfileSubmit}>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className={styles.formLabel}>
                                                            <FaUser className="me-2" />
                                                            Tên đăng nhập
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={userData.username || ''}
                                                            onChange={(e) => setUserData({
                                                                ...userData,
                                                                username: e.target.value
                                                            })}
                                                            className={styles.formControl}
                                                            placeholder="Nhập tên đăng nhập"
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
                                                            value={userData.email || ''}
                                                            disabled
                                                            className={styles.formControl}
                                                        />
                                                        <Form.Text className="text-muted">
                                                            Email không thể thay đổi
                                                        </Form.Text>
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Form.Group className="mb-4">
                                                <Form.Label className={styles.formLabel}>
                                                    <FaEdit className="me-2" />
                                                    Tên hiển thị
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={userData.displayName || ''}
                                                    onChange={(e) => setUserData({
                                                        ...userData,
                                                        displayName: e.target.value
                                                    })}
                                                    className={styles.formControl}
                                                    placeholder="Nhập tên hiển thị"
                                                />
                                                <Form.Text className="text-muted">
                                                    Tên này sẽ được hiển thị công khai
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
                                                id="job-alerts"
                                                label="Thông báo việc làm mới"
                                                checked={notificationSettings.jobAlerts}
                                                onChange={(e) => setNotificationSettings({
                                                    ...notificationSettings,
                                                    jobAlerts: e.target.checked
                                                })}
                                                className={styles.switchControl}
                                            />
                                            <Form.Text className="text-muted">
                                                Nhận thông báo về cơ hội việc làm phù hợp
                                            </Form.Text>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Check
                                                type="switch"
                                                id="system-notifications"
                                                label="Thông báo hệ thống"
                                                checked={notificationSettings.systemNotifications}
                                                onChange={(e) => setNotificationSettings({
                                                    ...notificationSettings,
                                                    systemNotifications: e.target.checked
                                                })}
                                                className={styles.switchControl}
                                            />
                                            <Form.Text className="text-muted">
                                                Thông báo về cập nhật hệ thống và bảo trì
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
                                                Nhận thông tin về tính năng mới và ưu đãi
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

                                {/* Privacy Tab */}
                                <Tab eventKey="privacy" title={
                                    <span>
                                        <FaShieldAlt className="me-2" />
                                        Riêng tư
                                    </span>
                                }>
                                    <div className={styles.tabContent}>
                                        <h4 className="mb-4">Cài đặt riêng tư</h4>

                                        <Form.Group className="mb-3">
                                            <Form.Label className={styles.formLabel}>
                                                Hiển thị hồ sơ
                                            </Form.Label>
                                            <Form.Select
                                                value={privacySettings.profileVisibility}
                                                onChange={(e) => setPrivacySettings({
                                                    ...privacySettings,
                                                    profileVisibility: e.target.value
                                                })}
                                                className={styles.formControl}
                                            >
                                                <option value="public">Công khai</option>
                                                <option value="private">Riêng tư</option>
                                                <option value="limited">Hạn chế</option>
                                            </Form.Select>
                                            <Form.Text className="text-muted">
                                                Kiểm soát ai có thể xem hồ sơ của bạn
                                            </Form.Text>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Check
                                                type="switch"
                                                id="search-visibility"
                                                label="Cho phép tìm kiếm hồ sơ"
                                                checked={privacySettings.searchVisibility}
                                                onChange={(e) => setPrivacySettings({
                                                    ...privacySettings,
                                                    searchVisibility: e.target.checked
                                                })}
                                                className={styles.switchControl}
                                            />
                                            <Form.Text className="text-muted">
                                                Cho phép nhà tuyển dụng tìm thấy hồ sơ của bạn
                                            </Form.Text>
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Check
                                                type="switch"
                                                id="allow-messages"
                                                label="Cho phép nhận tin nhắn"
                                                checked={privacySettings.allowMessages}
                                                onChange={(e) => setPrivacySettings({
                                                    ...privacySettings,
                                                    allowMessages: e.target.checked
                                                })}
                                                className={styles.switchControl}
                                            />
                                            <Form.Text className="text-muted">
                                                Cho phép nhà tuyển dụng gửi tin nhắn cho bạn
                                            </Form.Text>
                                        </Form.Group>

                                        <div className="d-flex justify-content-end">
                                            <Button
                                                variant="primary"
                                                onClick={handlePrivacyUpdate}
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

                                {/* Theme & Language Tab */}
                                <Tab eventKey="theme" title={
                                    <span>
                                        <FaPalette className="me-2" />
                                        Giao diện
                                    </span>
                                }>
                                    <div className={styles.tabContent}>
                                        <h4 className="mb-4">Giao diện và ngôn ngữ</h4>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className={styles.formLabel}>
                                                        <FaPalette className="me-2" />
                                                        Chủ đề
                                                    </Form.Label>
                                                    <Form.Select
                                                        value={themeSettings.theme}
                                                        onChange={(e) => setThemeSettings({
                                                            ...themeSettings,
                                                            theme: e.target.value
                                                        })}
                                                        className={styles.formControl}
                                                    >
                                                        <option value="light">Sáng</option>
                                                        <option value="dark">Tối</option>
                                                        <option value="auto">Tự động</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className={styles.formLabel}>
                                                        <FaGlobe className="me-2" />
                                                        Ngôn ngữ
                                                    </Form.Label>
                                                    <Form.Select
                                                        value={themeSettings.language}
                                                        onChange={(e) => setThemeSettings({
                                                            ...themeSettings,
                                                            language: e.target.value
                                                        })}
                                                        className={styles.formControl}
                                                    >
                                                        <option value="vi">Tiếng Việt</option>
                                                        <option value="en">English</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <div className="d-flex justify-content-end">
                                            <Button
                                                variant="primary"
                                                onClick={handleThemeUpdate}
                                                disabled={loading}
                                                className={styles.saveButton}
                                            >
                                                {loading ? (
                                                    <Spinner size="sm" className="me-2" />
                                                ) : (
                                                    <FaSave className="me-2" />
                                                )}
                                                Áp dụng
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

                                        <Alert variant="info" className="mt-3">
                                            <FaShieldAlt className="me-2" />
                                            Tài khoản của bạn được bảo vệ với các biện pháp bảo mật hiện đại
                                        </Alert>
                                    </div>
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Sidebar */}
                <Col lg={3}>
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
                                    src={avatarPreview || '/src/assets/images/avatar-default.jpg'}
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

                    {/* Quick Actions */}
                    <Card className={styles.settingsCard}>
                        <Card.Header className={styles.cardHeader}>
                            <h5>
                                <FaCog className="me-2" />
                                Thao tác nhanh
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-grid gap-2">
                                <Button variant="outline-primary" size="sm">
                                    <FaBell className="me-2" />
                                    Quản lý thông báo
                                </Button>
                                <Button variant="outline-secondary" size="sm">
                                    <FaShieldAlt className="me-2" />
                                    Cài đặt riêng tư
                                </Button>
                                <Button variant="outline-warning" size="sm">
                                    <FaLock className="me-2" />
                                    Đổi mật khẩu
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Account Status */}
                    <Card className={styles.settingsCard}>
                        <Card.Header className={styles.cardHeader}>
                            <h5>Trạng thái tài khoản</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex align-items-center mb-2">
                                <Badge bg="success" className="me-2">Đã xác thực</Badge>
                            </div>
                            <p className="text-muted small mb-0">
                                Tài khoản của bạn đã được xác thực và bảo mật
                            </p>
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

export default UserSettings;
