import axiosInstance from './axiosInstance';

export const getAllJobFields = () => axiosInstance.get('/api/JobFields').then(res => res.data);

// Admin API functions for JobFields management
export const getAllJobFieldsForAdmin = () =>
    axiosInstance.get('/api/JobFields/admin').then(res => res.data);

export const getJobFieldById = (id) =>
    axiosInstance.get(`/api/JobFields/admin/${id}`).then(res => res.data);

export const createJobField = (data) =>
    axiosInstance.post('/api/JobFields/admin', data).then(res => res.data);

export const updateJobField = (id, data) =>
    axiosInstance.put(`/api/JobFields/admin/${id}`, data).then(res => res.data);

export const deleteJobField = (id) =>
    axiosInstance.delete(`/api/JobFields/admin/${id}`).then(res => res.data);
