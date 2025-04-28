import axiosInstance from './axiosInstance';

export const getAllPackages = () =>
    axiosInstance.get('/api/PackagesPost').then(res => res.data);

export const getPackageStatistics = () =>
    axiosInstance.get('/api/PackagesPost/post-package-statistics').then(res => res.data);

export const getPostsUsingPackages = () =>
    axiosInstance.get('/api/PackagesPost/posts-using-packages').then(res => res.data);

export const getCompanyPostPackages = () =>
    axiosInstance.get('/api/PackagesPost/company-post-packages').then(res => res.data);

export const createPackage = (data) =>
    axiosInstance.post('/api/PackagesPost', data);

export const updatePackage = (id, data) =>
    axiosInstance.put(`/api/PackagesPost/${id}`, data);

export const deletePackage = (id) =>
    axiosInstance.delete(`/api/PackagesPost/${id}`);
export const getAllProPackages = () =>
    axiosInstance.get('/api/PackagesPro/pro-packages').then(res => res.data);

