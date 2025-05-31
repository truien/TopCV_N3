import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotificationContext } from "../contexts/notification-context.js";
import { formatDistance } from "date-fns";
import { vi } from "date-fns/locale";
import './NotificationDropdown.css';

/**
 * Component hiển thị danh sách thông báo
 * @returns {JSX.Element} NotificationDropdown component
 */
const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
    const dropdownRef = useRef(null);
    const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotificationContext();

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Định dạng thời gian
    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return formatDistance(date, new Date(), { addSuffix: true, locale: vi });
    };

    // Xử lý click vào thông báo
    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
        setIsOpen(false);
    };

    // Xử lý đánh dấu tất cả là đã đọc
    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    // Lọc thông báo theo trạng thái
    const filteredNotifications = notifications?.filter(notification => {
        if (filter === 'unread') return !notification.isRead;
        if (filter === 'read') return notification.isRead;
        return true; // 'all'
    }) || [];

    return (
        <div className="position-relative" ref={dropdownRef}>
            {/* Nút thông báo */}
            <button
                className={`notification-toggle ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Thông báo"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown thông báo */}
            {isOpen && (
                <div className="notification-dropdown">
                    {/* Header */}
                    <div className="notification-header">
                        <div className="header-content">
                            <h3 className="header-title">Thông báo</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="mark-all-read-btn"
                                >
                                    Đánh dấu đã đọc
                                </button>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="notification-tabs">
                            <button
                                className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                Tất cả
                                <span className="tab-count">{notifications?.length || 0}</span>
                            </button>
                            <button
                                className={`tab-btn ${filter === 'unread' ? 'active' : ''}`}
                                onClick={() => setFilter('unread')}
                            >
                                Chưa đọc
                                {unreadCount > 0 && <span className="tab-count unread">{unreadCount}</span>}
                            </button>
                        </div>
                    </div>

                    {/* Danh sách thông báo */}
                    <div className="notification-content">
                        {isLoading ? (
                            <div className="loading-state">
                                <div className="loading-spinner"></div>
                                <p>Đang tải thông báo...</p>
                            </div>
                        ) : filteredNotifications.length > 0 ? (
                            <div className="notification-list">
                                {filteredNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                    >
                                        <div className="notification-content-wrapper">
                                            <div className="notification-indicator">
                                                <div className={`indicator-dot ${!notification.isRead ? 'unread' : ''}`}></div>
                                            </div>
                                            <div className="notification-body">
                                                <h4 className="notification-title">{notification.title}</h4>
                                                <p className="notification-message">{notification.message}</p>
                                                <div className="notification-meta">
                                                    <span className="notification-time">{formatTime(notification.createdAt)}</span>
                                                    {!notification.isRead && <span className="new-badge">Mới</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <p className="empty-text">
                                    {filter === 'unread' && 'Không có thông báo chưa đọc'}
                                    {filter === 'read' && 'Không có thông báo đã đọc'}
                                    {filter === 'all' && 'Chưa có thông báo nào'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications?.length > 0 && (
                        <div className="notification-footer">
                            <Link
                                to="/notifications"
                                className="view-all-btn"
                                onClick={() => setIsOpen(false)}
                            >
                                Xem tất cả thông báo
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
