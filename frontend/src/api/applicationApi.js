import axiosInstance from './axiosInstance';

export const applyJob = (formData) =>
    axiosInstance.post('/api/Applications/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const hassApplied = (jobId) =>
    axiosInstance.get(`/api/Applications/has-applied/${jobId}`).then(res => res.data);

export const getApplicationsForEmployer = () =>
    axiosInstance.get('/api/applications/employer/all').then(res => res.data);

export const rejectApplication = (id, reason) =>
    axiosInstance.put(`/api/applications/${id}/status`, {
        status: 2,
        rejectReason: reason,
    });
