import axiosInstance from './axiosInstance';

export const reportJob = (data) => axiosInstance.post('/api/Report/job', data);
