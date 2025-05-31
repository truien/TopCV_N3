import * as signalR from "@microsoft/signalr";
import axiosInstance from "../api/axiosInstance.js";

// Khởi tạo kết nối SignalR
const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${import.meta.env.VITE_API_URL}/hubs/notifications`, {
        withCredentials: true
    })
    .withAutomaticReconnect()
    .build();

// Các hàm quản lý kết nối
export async function startNotificationHub() {
    try {
        if (connection.state === signalR.HubConnectionState.Disconnected) {
            await connection.start();
            console.log("SignalR connected");
        }
        return true;
    } catch (err) {
        console.error("SignalR connection error:", err);
        return false;
    }
}

export async function stopConnection() {
    try {
        if (connection.state !== signalR.HubConnectionState.Disconnected) {
            await connection.stop();
            console.log("SignalR disconnected");
        }
        return true;
    } catch (err) {
        console.error("Error disconnecting SignalR:", err);
        return false;
    }
}

export function getConnectionStatus() {
    return {
        isConnected: connection.state === signalR.HubConnectionState.Connected,
        state: connection.state
    };
}

// Các hàm đăng ký sự kiện
export function onReceiveNotification(handler) {
    connection.on("ReceiveNotification", handler);
}

export function offReceiveNotification(handler) {
    if (handler) {
        connection.off("ReceiveNotification", handler);
    } else {
        connection.off("ReceiveNotification");
    }
}

export function onUnreadCountUpdated(handler) {
    connection.on("UnreadCountUpdated", handler);
}

export function offUnreadCountUpdated(handler) {
    if (handler) {
        connection.off("UnreadCountUpdated", handler);
    } else {
        connection.off("UnreadCountUpdated");
    }
}

// Các hàm xử lý thông báo
export async function markAsRead(notificationId) {
    try {
        await axiosInstance.put(`/api/notification/${notificationId}/read`);
        return true;
    } catch (err) {
        console.error("Error marking notification as read:", err);
        return false;
    }
}

export async function markAllAsRead() {
    try {
        await axiosInstance.put(`/api/notification/mark-all-read`);
        return true;
    } catch (err) {
        console.error("Error marking all notifications as read:", err);
        return false;
    }
}
