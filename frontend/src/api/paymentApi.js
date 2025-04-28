import axios from './axiosInstance';

export const createMomoOrder = async (packageId, jobPostId) => {
    const res = await axios.post('/api/payment/momo-create', {
        packageId,
        jobPostId
    });
    return res.data;
};
export const createVNPayOrder = async (packageId, jobPostId) => {
    const res = await axios.post('/api/payment/vnpay-create', {
        packageId,
        jobPostId
    });
    return res.data;
};
export const createProVNPayOrder = async (packageId) => {
    const res = await axios.post('/api/payment/pro-create', {
        packageId: packageId,
    });
    return res.data;
};
