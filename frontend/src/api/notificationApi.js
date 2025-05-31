import axiosInstance from './axiosInstance';

// Lấy danh sách thông báo với phân trang và filter
export const getNotifications = (params = {}) =>
    axiosInstance.get('/api/notification', { params }).then(res => res.data);

// Lấy số lượng thông báo chưa đọc
export const getUnreadCount = () =>
    axiosInstance.get('/api/notification/unread-count').then(res => res.data.count);

// Đánh dấu thông báo đã đọc
export const markNotificationAsRead = (notificationId) =>
    axiosInstance.put(`/api/notification/${notificationId}/read`);

// Đánh dấu tất cả thông báo đã đọc
export const markAllNotificationsAsRead = () =>
    axiosInstance.put('/api/notification/mark-all-read');

// Xóa thông báo
export const deleteNotification = (notificationId) =>
    axiosInstance.delete(`/api/notification/${notificationId}`);

// Lấy chi tiết thông báo
export const getNotificationDetail = (notificationId) =>
    axiosInstance.get(`/api/notification/${notificationId}`).then(res => res.data);
