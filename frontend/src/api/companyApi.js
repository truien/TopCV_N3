import axiosInstance from './axiosInstance';

export const getCompanyBySlug = slug =>
    axiosInstance.get(`/api/Companies/${slug}`).then(res => res.data);
