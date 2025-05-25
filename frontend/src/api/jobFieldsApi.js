import axiosInstance from './axiosInstance';

export const getAllJobFields = () => axiosInstance.get('/api/JobFields').then(res => res.data);
