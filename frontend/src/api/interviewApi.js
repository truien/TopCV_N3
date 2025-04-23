import axiosInstance from './axiosInstance';
export const scheduleInterview = (data) =>
    axiosInstance.post('/api/interview/schedule', data);
export const getAllInterviews = () =>
    axiosInstance.get('/api/interview/employer/all').then(res => res.data);

export const getActiveJobs = () =>
    axiosInstance.get('/api/interview/employer/active').then(res => res.data);
