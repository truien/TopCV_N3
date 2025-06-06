import axiosInstance from './axiosInstance';

export const getAllEmploymentTypes = () => axiosInstance.get('/api/EmploymentTypes').then(res => res.data);

// Admin API functions for EmploymentTypes management
export const getAllEmploymentTypesForAdmin = () =>
    axiosInstance.get('/api/EmploymentTypes/admin').then(res => res.data);

export const getEmploymentTypeById = (id) =>
    axiosInstance.get(`/api/EmploymentTypes/admin/${id}`).then(res => res.data);

export const createEmploymentType = (data) =>
    axiosInstance.post('/api/EmploymentTypes/admin', data).then(res => res.data);

export const updateEmploymentType = (id, data) =>
    axiosInstance.put(`/api/EmploymentTypes/admin/${id}`, data).then(res => res.data);

export const deleteEmploymentType = (id) =>
    axiosInstance.delete(`/api/EmploymentTypes/admin/${id}`).then(res => res.data);
