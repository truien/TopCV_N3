import axiosInstance from './axiosInstance';

export const logout = () =>
    axiosInstance.post('/api/auth/logout');

export const forgotPassword = (email) =>
    axiosInstance
        .post('/api/auth/forgot-password', { email })
        .then(res => res.data);

export const resetPassword = (data) =>
    axiosInstance
        .post('/api/auth/reset-password', data)
        .then(res => res.data);

export const login = (data) =>
    axiosInstance
        .post('/api/auth/login', data)
        .then(res => res.data);

export const googleLogin = ({ token, roleId, fullName, companyName }) =>
    axiosInstance
        .post('/api/auth/google-login', { token, roleId, fullName, companyName })
        .then(res => res.data);


export const register = (data) =>
    axiosInstance
        .post('/api/auth/register', data)
        .then(res => res.data);

export const getAllUsers = (page, search) =>
    axiosInstance
        .get(`/api/auth/users?page=${page}&pageSize=5${search ? `&search=${search}` : ''}`)
        .then(res => res.data);

export const getUserStats = () =>
    axiosInstance
        .get('/api/auth/user-stats')
        .then(res => res.data);

export const deleteUser = (id) =>
    axiosInstance.delete(`/api/auth/delete/${id}`);
