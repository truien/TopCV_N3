import axiosInstance from './axiosInstance';

// Lấy danh sách đánh giá của một bài đăng
export const getJobPostReviews = async (jobPostId, page = 1, pageSize = 5) => {
    try {
        const response = await axiosInstance.get(`/api/JobPostReviews/jobpost/${jobPostId}?page=${page}&pageSize=${pageSize}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching job post reviews:', error);
        throw error;
    }
};

// Lấy thống kê đánh giá của một bài đăng
export const getJobPostReviewsStats = async (jobPostId) => {
    try {
        const response = await axiosInstance.get(`/api/JobPostReviews/jobpost/${jobPostId}/stats`);
        return response.data;
    } catch (error) {
        console.error('Error fetching job post reviews stats:', error);
        throw error;
    }
};

// Tạo đánh giá mới
export const createJobPostReview = async (reviewData) => {
    try {
        const response = await axiosInstance.post('/api/JobPostReviews', reviewData);
        return response.data;
    } catch (error) {
        console.error('Error creating job post review:', error);
        throw error;
    }
};

// Cập nhật đánh giá
export const updateJobPostReview = async (reviewId, reviewData) => {
    try {
        const response = await axiosInstance.put(`/api/JobPostReviews/${reviewId}`, reviewData);
        return response.data;
    } catch (error) {
        console.error('Error updating job post review:', error);
        throw error;
    }
};

// Xóa đánh giá
export const deleteJobPostReview = async (reviewId) => {
    try {
        const response = await axiosInstance.delete(`/api/JobPostReviews/${reviewId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting job post review:', error);
        throw error;
    }
};

// Lấy danh sách đánh giá của user
export const getUserReviews = async (userId, page = 1, pageSize = 10) => {
    try {
        const response = await axiosInstance.get(`/api/JobPostReviews/user/${userId}?page=${page}&pageSize=${pageSize}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        throw error;
    }
};

// Kiểm tra user đã đánh giá bài đăng chưa
export const checkUserReviewed = async (jobPostId) => {
    try {
        const response = await axiosInstance.get(`/api/JobPostReviews/check/${jobPostId}`);
        return response.data;
    } catch (error) {
        console.error('Error checking user reviewed:', error);
        throw error;
    }
};
