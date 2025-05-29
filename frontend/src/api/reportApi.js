import axiosInstance from './axiosInstance';

// User APIs
export const reportJob = (data) => axiosInstance.post('/api/Report/job', data);

// Admin APIs
export const getAllReports = (params) => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.pageSize) queryParams.append('pageSize', params.pageSize);
    if (params.status) queryParams.append('status', params.status);
    if (params.reason) queryParams.append('reason', params.reason);
    if (params.search) queryParams.append('search', params.search);

    return axiosInstance.get(`/api/Report/admin/all?${queryParams}`);
};

export const getReportStatistics = () => axiosInstance.get('/api/Report/admin/statistics');

export const updateReportStatus = (id, status) =>
    axiosInstance.put(`/api/Report/admin/${id}/status`, { status });

export const deleteReport = (id) => axiosInstance.delete(`/api/Report/admin/${id}`);

export const getReportDetail = (id) => axiosInstance.get(`/api/Report/admin/${id}`);
