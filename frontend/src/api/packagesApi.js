import axiosInstance from './axiosInstance';

// APIs for JobPost Packages
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

// APIs for Pro Packages
export const getAllProPackages = () =>
    axiosInstance.get('/api/PackagesPro/pro-packages').then(res => res.data);

export const getProPackageStatistics = () =>
    axiosInstance.get('/api/PackagesPro/statistics').then(res => res.data);

export const getSubscriptionsUsingProPackages = () =>
    axiosInstance.get('/api/PackagesPro/subscriptions-using-packages').then(res => res.data);

export const getCompanyProPackages = () =>
    axiosInstance.get('/api/PackagesPro/company-pro-packages').then(res => res.data);

export const createProPackage = (data) =>
    axiosInstance.post('/api/PackagesPro/create', data);

export const updateProPackage = (id, data) =>
    axiosInstance.put(`/api/PackagesPro/${id}`, data);

export const deleteProPackage = (id) =>
    axiosInstance.delete(`/api/PackagesPro/${id}`);

export const importProPackages = (formData) =>
    axiosInstance.post('/api/PackagesPro/import', formData);

