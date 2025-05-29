import axiosInstance from './axiosInstance';

// Lấy danh sách job posts với phân trang và tìm kiếm
export const getAdminJobPosts = (params) =>
    axiosInstance.get('/api/admin/AdminJobPosts', { params }).then(res => res.data);

// Lấy chi tiết job post
export const getAdminJobPost = (id) =>
    axiosInstance.get(`/api/admin/AdminJobPosts/${id}`).then(res => res.data);

// Cập nhật job post
export const updateAdminJobPost = (id, data) =>
    axiosInstance.put(`/api/admin/AdminJobPosts/${id}`, data);

// Xóa job post
export const deleteAdminJobPost = (id) =>
    axiosInstance.delete(`/api/admin/AdminJobPosts/${id}`);

// Cập nhật trạng thái job post
export const updateJobPostStatus = (id, statusData) =>
    axiosInstance.put(`/api/admin/AdminJobPosts/${id}/status`, statusData);

// Lấy thống kê
export const getJobPostStatistics = () =>
    axiosInstance.get('/api/admin/AdminJobPosts/statistics').then(res => res.data);

// Lấy danh sách ứng viên của job post
export const getJobPostApplications = (id, params) =>
    axiosInstance.get(`/api/admin/AdminJobPosts/${id}/applications`, { params }).then(res => res.data);
