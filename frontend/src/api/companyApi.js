import axiosInstance from './axiosInstance';

export const getCompanyBySlug = slug =>
    axiosInstance.get(`/api/Companies/${slug}`).then(res => res.data);

export const getTopAppliedCompanies = (top = 5) =>
    axiosInstance.get(`/api/Companies/top-applied?top=${top}`).then(res => res.data);

export const getFeaturedCompanies = (industry = '', page = 1, pageSize = 4) =>
    axiosInstance.get(`/api/companies/featured?industry=${industry}&page=${page}&pageSize=${pageSize}`).then(res => res.data);
