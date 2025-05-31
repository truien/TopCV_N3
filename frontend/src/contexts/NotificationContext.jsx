import React, { useEffect, useState, useCallback } from "react";
import { useNotification } from "../hooks/useNotification.jsx";
import { useAuth } from "./AuthContext";
import { NotificationContext } from "./notification-context.js";

/**
 * Provider cho thông báo real-time
 * @param {Object} props 
 * @returns {JSX.Element} 
 */
export const NotificationProvider = ({ children }) => {
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const {
        notifications,
        unreadCount,
        isConnected,
        connectionState,
        isLoading,
        connectAndLoad,
        disconnect,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
    } = useNotification(false);

    const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

    useEffect(() => {
        if (!authLoading) {
            if (isAuthenticated) {
                connectAndLoad();
            } else {
                disconnect();
            }
        }
    }, [isAuthenticated, authLoading, connectAndLoad, disconnect]);

    const safeRefreshNotifications = useCallback(async () => {
        try {
            await refreshNotifications();
        } catch (err) {
            console.warn("Error when refreshing notifications:", err);
        } finally {
            setHasFetchedOnce(true);
        }
    }, [refreshNotifications]);

    useEffect(() => {
        if (
            isAuthenticated &&
            !authLoading &&
            isConnected &&
            !hasFetchedOnce
        ) {
            const retryTimer = setTimeout(() => {
                console.log("Retrying to load notification data...");
                safeRefreshNotifications();
            }, 2000);

            return () => clearTimeout(retryTimer);
        }
    }, [
        isAuthenticated,
        authLoading,
        isConnected,
        hasFetchedOnce,
        safeRefreshNotifications,
    ]);

    const value = {
        notifications,
        unreadCount,
        isConnected,
        connectionState,
        isLoading,
        markAsRead,
        markAllAsRead,
        refreshNotifications, 
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
