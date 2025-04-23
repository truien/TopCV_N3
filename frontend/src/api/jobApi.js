import axiosInstance from './axiosInstance';

export const getJobDetail = (id) => axiosInstance.get(`/api/JobPosts/${id}`).then(res => res.data);
export const getPromotedJobs = (params) => axiosInstance.get('/api/JobPosts/promoted', { params }).then(res => res.data);
export const getRelatedJobs = (params) => axiosInstance.get('/api/JobPosts/related', { params }).then(res => res.data);
export const getCompanyJobs = (employerId) => axiosInstance.get(`/api/JobPosts/get-jobpost-by-id/${employerId}`).then(res => res.data);
export const createJobPost = (data) => axiosInstance.post('/api/JobPosts/create', data);
