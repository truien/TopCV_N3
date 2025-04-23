import axiosInstance from './axiosInstance';

export const saveJob = (jobId) =>
    axiosInstance.post(`/api/SaveJob/save-job/${jobId}`);

