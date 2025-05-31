import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
    startNotificationHub,
    onReceiveNotification,
    offReceiveNotification,
    onUnreadCountUpdated,
    offUnreadCountUpdated,
    markAsRead,
    markAllAsRead,
    getConnectionStatus,
    stopConnection,
} from "../services/notificationHub";
import {
    getNotifications,
    getUnreadCount,
} from "../api/notificationApi";

/**
 * Custom hook để sử dụng thông báo real-time với SignalR
 * @param {boolean} autoConnect - Tự động kết nối khi component được mount
 * @param {boolean} showToast - Hiển thị toast khi có thông báo mới
 * @returns {Object} - Các methods và states liên quan đến thông báo
 */
export const useNotification = (autoConnect = true, showToast = true) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [connectionState, setConnectionState] = useState({ isConnected: false });
    const [isLoading, setIsLoading] = useState(autoConnect); // Chỉ loading nếu autoConnect=true    // Load dữ liệu thông báo ban đầu
    const loadInitialData = useCallback(async () => {
        try {
            setIsLoading(true);

            // Load danh sách thông báo (tất cả, không phân trang)
            const notificationsResponse = await getNotifications({
                page: 1,
                pageSize: 50  // Load 50 thông báo gần nhất
            });

            if (notificationsResponse && notificationsResponse.data) {
                setNotifications(notificationsResponse.data);
            }

            // Load số lượng chưa đọc
            const unreadCountResponse = await getUnreadCount();
            setUnreadCount(unreadCountResponse || 0);

        } catch (error) {
            // Chỉ reset state nếu là lỗi không phải unauthorized
            if (error.response?.status !== 401) {
                console.error("Error loading initial notification data:", error);
                setNotifications([]);
                setUnreadCount(0);
            } else {
                // Với lỗi 401, chỉ log warning và return
                console.warn("Unauthorized access to notifications - auth may not be ready");
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Xử lý khi nhận thông báo mới
    const handleNewNotification = useCallback((notification) => {
        console.log("Received new notification", notification);

        // Cập nhật danh sách thông báo
        setNotifications(prev => [notification, ...prev]);

        // Cập nhật số lượng chưa đọc
        setUnreadCount(prev => prev + 1);

        // Hiển thị thông báo dạng toast nếu được yêu cầu
        if (showToast) {
            toast.info(
                <div>
                    <div className="font-bold">{notification.title}</div>
                    <div>{notification.message}</div>
                </div>,
                {
                    onClick: () => {
                        // Xử lý khi nhấp vào toast
                        console.log("Notification clicked", notification);
                        // Có thể chuyển hướng đến trang chi tiết thông báo
                    }
                }
            );
        }
    }, [showToast]);

    // Xử lý khi có cập nhật số lượng thông báo chưa đọc
    const handleUnreadCountUpdated = useCallback((count) => {
        console.log("Unread count updated:", count);
        setUnreadCount(count);
    }, []);    // Kết nối đến SignalR hub
    const connect = useCallback(async () => {
        setIsLoading(true);
        const result = await startNotificationHub();
        setConnectionState(getConnectionStatus());

        // Load dữ liệu ban đầu sau khi kết nối thành công
        if (result) {
            await loadInitialData();
        }

        setIsLoading(false);
        return result;
    }, [loadInitialData]);    // Kết nối và load dữ liệu (dành cho manual connection)
    const connectAndLoad = useCallback(async () => {
        setIsLoading(true);
        try {
            const connectionResult = await startNotificationHub();
            setConnectionState(getConnectionStatus());

            if (connectionResult) {
                // Retry logic cho loadInitialData nếu gặp 401
                let retryCount = 0;
                const maxRetries = 3;

                while (retryCount < maxRetries) {
                    try {
                        await loadInitialData();
                        break; // Thành công, thoát khỏi loop
                    } catch (error) {
                        if (error.response?.status === 401 && retryCount < maxRetries - 1) {
                            console.warn(`Notification load failed (401), retrying... (${retryCount + 1}/${maxRetries})`);
                            retryCount++;
                            // Delay tăng dần: 500ms, 1000ms, 1500ms
                            await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)));
                        } else {
                            // Nếu vẫn 401 sau khi retry hết, chỉ log warning
                            if (error.response?.status === 401) {
                                console.warn("Authentication not ready for notifications, will try again later");
                                return connectionResult; // Return connection result, không throw error
                            }
                            throw error; // Re-throw nếu không phải 401
                        }
                    }
                }
            }
            return connectionResult;
        } catch (error) {
            console.error("Error connecting and loading data:", error);
            // Chỉ log error nếu không phải 401
            if (error.response?.status !== 401) {
                console.error("Non-auth error in connectAndLoad:", error);
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [loadInitialData]);

    // Đánh dấu thông báo đã đọc
    const handleMarkAsRead = useCallback(async (notificationId) => {
        const success = await markAsRead(notificationId);
        if (success) {
            // Cập nhật UI
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        return success;
    }, []);

    // Đánh dấu tất cả đã đọc
    const handleMarkAllAsRead = useCallback(async () => {
        const success = await markAllAsRead();
        if (success) {
            // Cập nhật UI
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
        }
        return success;
    }, []);    // Ngắt kết nối
    const disconnect = useCallback(async () => {
        await stopConnection();
        setConnectionState(getConnectionStatus());
        // Reset notification state khi disconnect
        setNotifications([]);
        setUnreadCount(0);
    }, []);// Kết nối khi component được mount
    useEffect(() => {
        if (autoConnect) {
            connect();
        }
        // Không load dữ liệu ban đầu nếu autoConnect=false
        // Dữ liệu sẽ được load khi connect() được gọi manual

        // Đăng ký các handlers
        onReceiveNotification(handleNewNotification);
        onUnreadCountUpdated(handleUnreadCountUpdated);

        // Cleanup khi component unmount
        return () => {
            offReceiveNotification(handleNewNotification);
            offUnreadCountUpdated(handleUnreadCountUpdated);
        };
    }, [autoConnect, connect, handleNewNotification, handleUnreadCountUpdated]); return {
        notifications,
        unreadCount,
        isConnected: connectionState.isConnected,
        connectionState,
        isLoading,
        connect,
        connectAndLoad,
        disconnect,
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
        refreshNotifications: loadInitialData, // Thêm method để refresh dữ liệu
    };
};
