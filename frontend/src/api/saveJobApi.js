import axiosInstance from "./axiosInstance";

export const saveJob = (jobId) =>
  axiosInstance.post(`/api/SaveJob/save-job/${jobId}`);

export const getSavedJobs = (params) =>
  axiosInstance
    .get("/api/SaveJob/saved-jobs", { params })
    .then((res) => res.data);

export const unsaveJob = (jobId) =>
  axiosInstance.delete(`/api/SaveJob/unsave-job/${jobId}`);

export const checkJobSaved = (jobId) =>
  axiosInstance
    .get(`/api/SaveJob/check-saved/${jobId}`)
    .then((res) => res.data);
