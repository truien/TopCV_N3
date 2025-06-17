import axiosInstance from './axiosInstance';

export const getUserProfile = () => axiosInstance.get('/api/user/profile').then(res => res.data);
export const checkHasCV = () => axiosInstance.get('/api/user/cv').then(res => res.data);
export const getProSubscription = async () => {
    const res = await axiosInstance.get('/api/user/pro-subscription');
    return res.data;
};