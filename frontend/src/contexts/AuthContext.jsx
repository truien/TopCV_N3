import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserProfile } from "../api/userApi";

const AuthContext = createContext();

/**
 * @returns {Object} 
 */
export const useAuth = () => useContext(AuthContext);

/**
 * @param {Object} props
 * @returns {JSX.Element} 
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                setIsLoading(true);
                const userData = await getUserProfile();
                if (userData) {
                    setUser(userData);
                    setIsAuthenticated(true);
                }
            // eslint-disable-next-line no-unused-vars
            } catch (error) {
                setUser(null);
                setIsAuthenticated(false);
                console.log("User not authenticated or error fetching user data");
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
