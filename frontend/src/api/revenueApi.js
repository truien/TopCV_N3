import axiosInstance from './axiosInstance';

// API lấy thống kê doanh thu tổng quan
export const getRevenueSummary = () =>
    axiosInstance.get('/api/Revenue/summary').then(res => res.data);

// API lấy dữ liệu biểu đồ doanh thu theo thời gian
export const getRevenueChartData = (period = 'monthly') =>
    axiosInstance.get(`/api/Revenue/chart-data?period=${period}`).then(res => res.data);

// API lấy chi tiết đơn hàng theo khoảng thời gian
export const getRevenueDetails = (startDate, endDate) =>
    axiosInstance.get(`/api/Revenue/details`, {
        params: {
            startDate,
            endDate
        }
    }).then(res => res.data);