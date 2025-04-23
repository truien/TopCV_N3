import axiosInstance from './axiosInstance';

export const logout = () => axiosInstance.post('/api/auth/logout');
export const forgotPassword = (email) =>
    axiosInstance.post('/api/auth/forgot-password', { email }).then(res => res.data);
export const resetPassword = (data) =>
    axiosInstance.post('/api/auth/reset-password', data).then(res => res.data);
export const login = (data) => axiosInstance.post('/api/auth/login', data).then(res => res.data);
export const googleLogin = (token) => axiosInstance.post('/api/Auth/google-login', { token }).then(res => res.data);
export const registerWithGoogle = (payload) => axiosInstance.post('/api/Auth/register-with-google', payload).then(res => res.data);
export const register = (data) =>
    axiosInstance.post('/api/auth/register', data).then(res => res.data);
export const getAllUsers = (page) =>
    axiosInstance.get(`/api/auth/users?page=${page}&pageSize=5`).then(res => res.data);

export const deleteUser = (id) =>
    axiosInstance.delete(`/api/auth/delete/${id}`);

