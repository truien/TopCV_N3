import axiosInstance from './axiosInstance';

export const getAllEmploymentTypes = () => axiosInstance.get('/api/EmploymentTypes').then(res => res.data);
