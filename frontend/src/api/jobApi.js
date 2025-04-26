import axiosInstance from './axiosInstance';

export const getJobDetail = (id) => axiosInstance.get(`/api/JobPosts/${id}`).then(res => res.data);
export const getPromotedJobs = (params) => axiosInstance.get('/api/JobPosts/promoted', { params }).then(res => res.data);
export const getRelatedJobs = (params) => axiosInstance.get('/api/JobPosts/related', { params }).then(res => res.data);
export const getCompanyJobs = (employerId) => axiosInstance.get(`/api/JobPosts/get-jobpost-by-id/${employerId}`).then(res => res.data);
export const createJobPost = (data) => axiosInstance.post('/api/JobPosts/create', data);
export const getEmployerJobPosts = async () => {
    const res = await axiosInstance.get('/api/jobposts/employer');
    return res.data;
};
export const updateJobPostStatus = async (id, status) => {
    const res = await axiosInstance.put(`/api/jobposts/${id}/status`, status, {
        headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
};
export const deleteJobPost = async (id) => {
    const res = await axiosInstance.delete(`/api/jobposts/${id}`);
    return res.data;
};
export const getJobPostsWithPackage = async () => {
    const res = await axiosInstance.get('/api/jobposts/employer-with-package');
    return res.data;
};
