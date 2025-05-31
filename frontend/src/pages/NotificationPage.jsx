import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificationContext } from "../contexts/notification-context.js";
import { format, formatDistance } from "date-fns";
import { vi } from "date-fns/locale";
import axiosInstance from "../api/axiosInstance.js";
import styles from "./NotificationPage.module.css";
import Header from "@/components/Header/Header.jsx";

const NotificationPage = () => {
    const navigate = useNavigate();
    const { markAsRead, markAllAsRead } = useNotificationContext();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState({
        type: "",
        isRead: null,
    });    // Lấy danh sách thông báo từ API
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                // Xây dựng query parameters
                let params = { page: currentPage, pageSize: 10 };
                if (filter.type) {
                    params.type = filter.type;
                }
                if (filter.isRead !== null) {
                    params.isRead = filter.isRead;
                }

                const response = await axiosInstance.get("/api/notification", { params });
                if (response.data && response.data.data) {
                    setNotifications(response.data.data);
                    setTotalPages(response.data.totalPages || 1);
                } else {
                    setNotifications([]);
                    setTotalPages(1);
                }
            } catch (error) {
                console.error("Error fetching notifications:", error);
                setNotifications([]);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [currentPage, filter]);

    // Format thời gian
    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return formatDistance(date, new Date(), { addSuffix: true, locale: vi });
    };

    // Format thời gian đầy đủ
    const formatFullDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return format(date, "HH:mm 'ngày' dd/MM/yyyy", { locale: vi });
    };

    // Xử lý click vào thông báo
    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            // Gọi API và cập nhật UI
            await markAsRead(notification.id);
            // Cập nhật danh sách local
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notification.id ? { ...n, isRead: true } : n
                )
            );
        }

        // Xử lý điều hướng dựa vào loại thông báo
        if (notification.data) {
            try {
                // Parse data nếu cần
                // const notificationData = typeof notification.data === "string"
                //     ? JSON.parse(notification.data)
                //     : notification.data;

                // Định tuyến dựa trên loại thông báo và dữ liệu
                switch (notification.type) {
                    case "NEW_APPLICATION":
                        // Chuyển đến trang quản lý ứng viên
                        navigate(`/employer/applicantmanagement`);
                        break;
                    case "APPLICATION_STATUS_UPDATE":
                        // Chuyển đến trang chi tiết ứng tuyển
                        navigate(`/candidate/interviews`);
                        break;
                    case "INTERVIEW_INVITATION":
                        // Chuyển đến trang phỏng vấn
                        navigate(`/candidate/interviews`);
                        break;
                    case "NEW_FOLLOWER":
                        // Chuyển đến trang người theo dõi
                        navigate(`/profile/followers`);
                        break;
                    case "NEW_REPORT":
                        // Chuyển đến trang báo cáo
                        navigate(`/admin/reports`);
                        break;
                    // Thêm các loại thông báo khác khi cần
                    default:
                        console.log("Không có hành động cụ thể cho loại thông báo này");
                }
            } catch (err) {
                console.error("Error parsing notification data", err);
            }
        }
    }; return (
        <>
            <Header />
            <div className={styles.notificationPage}>
                <div className={styles.notificationContainer}>
                    {/* Header */}
                    <div className={styles.notificationPageHeader}>
                        <div className={styles.headerContent}>
                            <h1 className={styles.pageTitle}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Thông báo
                            </h1>
                            <button
                                onClick={() => markAllAsRead()}
                                className={styles.markAllBtn}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Đánh dấu tất cả đã đọc
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className={styles.notificationFilters}>
                        <div className={styles.filterGroup}>
                            <div className={styles.filterItem}>
                                <label className={styles.filterLabel}>Loại thông báo</label>
                                <select
                                    className={styles.filterSelect}
                                    value={filter.type}
                                    onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                                >
                                    <option value="">Tất cả loại</option>
                                    <option value="NEW_APPLICATION">Đơn ứng tuyển mới</option>
                                    <option value="APPLICATION_STATUS_UPDATE">Cập nhật trạng thái</option>
                                    <option value="NEW_FOLLOWER">Người theo dõi mới</option>
                                    <option value="INTERVIEW_INVITATION">Lời mời phỏng vấn</option>
                                    <option value="NEW_REPORT">Báo cáo mới</option>
                                </select>
                            </div>
                            <div className={styles.filterItem}>
                                <label className={styles.filterLabel}>Trạng thái</label>
                                <select
                                    className={styles.filterSelect}
                                    value={filter.isRead === null ? "" : filter.isRead.toString()}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFilter({
                                            ...filter,
                                            isRead: value === "" ? null : value === "true"
                                        });
                                    }}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="false">Chưa đọc</option>
                                    <option value="true">Đã đọc</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className={styles.notificationsWrapper}>
                        {loading ? (
                            <div className={styles.loadingState}>
                                <div className={styles.loadingSpinner}></div>
                                <p>Đang tải thông báo...</p>
                            </div>
                        ) : notifications && notifications.length > 0 ? (
                            <div className={styles.notificationsList}>
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`${styles.notificationCard} ${!notification.isRead ? styles.unread : ''}`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className={styles.notificationIndicator}>
                                            <div className={`${styles.indicatorDot} ${!notification.isRead ? styles.unread : ''}`}></div>
                                        </div>

                                        <div className={styles.notificationContent}>
                                            <div className={styles.notificationHeader}>
                                                <h3 className={styles.notificationTitle}>{notification.title}</h3>
                                                <span className={styles.notificationTime}>
                                                    {formatTime(notification.createdAt)}
                                                </span>
                                            </div>

                                            <p className={styles.notificationMessage}>{notification.message}</p>

                                            {notification.sender && (
                                                <div className={styles.notificationSender}>
                                                    <img
                                                        src={notification.sender.avatar || "https://via.placeholder.com/32"}
                                                        alt={notification.sender.username}
                                                        className={styles.senderAvatar}
                                                    />
                                                    <span className={styles.senderName}>{notification.sender.username}</span>
                                                </div>
                                            )}

                                            {notification.isRead && notification.readAt && (
                                                <div className={styles.readStatus}>
                                                    Đã đọc lúc {formatFullDate(notification.readAt)}
                                                </div>
                                            )}

                                            {!notification.isRead && (
                                                <div className={styles.unreadBadge}>Mới</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 className={styles.emptyTitle}>Không có thông báo</h3>
                                <p className={styles.emptyDescription}>
                                    {filter.type && "Không có thông báo nào phù hợp với bộ lọc."}
                                    {filter.isRead === false && "Bạn đã đọc tất cả thông báo."}
                                    {!filter.type && filter.isRead === null && "Hiện tại chưa có thông báo nào."}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className={styles.paginationWrapper}>
                            <div className={styles.pagination}>
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className={`${styles.paginationBtn} ${styles.prev}`}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Trước
                                </button>

                                <div className={styles.paginationNumbers}>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let page;
                                        if (totalPages <= 5) {
                                            page = i + 1;
                                        } else if (currentPage <= 3) {
                                            page = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            page = totalPages - 4 + i;
                                        } else {
                                            page = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`${styles.paginationNumber} ${currentPage === page ? styles.active : ''}`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`${styles.paginationBtn} ${styles.next}`}
                                >
                                    Tiếp
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationPage;
