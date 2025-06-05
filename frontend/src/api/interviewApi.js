import axiosInstance from './axiosInstance';

export const scheduleInterview = (data) =>
    axiosInstance.post('/api/interview/schedule', data);

export const getAllInterviews = () =>
    axiosInstance.get('/api/interview/employer/all').then(res => res.data);

export const getActiveJobs = () =>
    axiosInstance.get('/api/interview/employer/active').then(res => res.data);

export const updateInterviewStatus = (interviewId, status, note = '') =>
    axiosInstance.put(`/api/interview/${interviewId}/status`, { status, note }).then(res => res.data);

export const rescheduleInterview = (interviewId, newDate, newTime, note = '') =>
    axiosInstance.put(`/api/interview/${interviewId}/reschedule`, {
        scheduledDate: newDate,
        scheduledTime: newTime,
        note
    }).then(res => res.data);

export const confirmInterviewByToken = (token, response) =>
    axiosInstance.get(
        `/api/interview/confirm/${token}/${response}`
    ).then(res => res.data);