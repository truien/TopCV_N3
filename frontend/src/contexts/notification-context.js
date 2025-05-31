import { createContext, useContext } from "react";

// Tạo context
export const NotificationContext = createContext();

/**
 * Hook để sử dụng NotificationContext
 * @returns {Object} Notification context
 */
export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotificationContext must be used within a NotificationProvider");
    }
    return context;
};
