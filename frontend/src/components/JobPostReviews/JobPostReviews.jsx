import React, { useState, useEffect, useCallback } from 'react';
import { FaStar, FaRegStar, FaUser, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
    getJobPostReviews,
    getJobPostReviewsStats,
    createJobPostReview,
    updateJobPostReview,
    deleteJobPostReview,
    checkUserReviewed
} from '@/api/jobPostReviewsApi';
import styles from './JobPostReviews.module.css';

const JobPostReviews = ({ jobPostId, currentUserId }) => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0, ratingCounts: {} });
    const [showAddReview, setShowAddReview] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [loading, setLoading] = useState(false);

    // Debug logging
    console.log('JobPostReviews props:', { jobPostId, currentUserId });
    console.log('hasReviewed:', hasReviewed);
    console.log('Should show add review button:', currentUserId && !hasReviewed); const fetchReviews = useCallback(async () => {
        try {
            const data = await getJobPostReviews(jobPostId);
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            // Set empty array for now to show UI
            setReviews([]);
        }
    }, [jobPostId]);

    const fetchStats = useCallback(async () => {
        try {
            const data = await getJobPostReviewsStats(jobPostId);
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Set default stats to show UI
            setStats({ averageRating: 0, totalReviews: 0, ratingCounts: {} });
        }
    }, [jobPostId]);

    const checkIfUserReviewed = useCallback(async () => {
        try {
            const data = await checkUserReviewed(jobPostId);
            setHasReviewed(data.hasReviewed);
        } catch (error) {
            console.error('Error checking user reviewed:', error);
            // Set false to show add review button
            setHasReviewed(false);
        }
    }, [jobPostId]);

    useEffect(() => {
        if (jobPostId) {
            fetchReviews();
            fetchStats();
            if (currentUserId) {
                checkIfUserReviewed();
            }
        }
    }, [jobPostId, currentUserId, fetchReviews, fetchStats, checkIfUserReviewed]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!currentUserId) {
            toast.warning('Vui lòng đăng nhập để đánh giá');
            return;
        }

        setLoading(true);
        try {
            const reviewData = {
                jobPostId: parseInt(jobPostId),
                rating: newReview.rating,
                comment: newReview.comment.trim()
            };

            if (editingReview) {
                await updateJobPostReview(editingReview.id, reviewData);
                toast.success('Cập nhật đánh giá thành công');
                setEditingReview(null);
            } else {
                await createJobPostReview(reviewData);
                toast.success('Thêm đánh giá thành công');
                setHasReviewed(true);
            }

            setNewReview({ rating: 5, comment: '' });
            setShowAddReview(false);
            fetchReviews();
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;

        try {
            await deleteJobPostReview(reviewId);
            toast.success('Xóa đánh giá thành công');
            setHasReviewed(false);
            fetchReviews();
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleEditReview = (review) => {
        setEditingReview(review);
        setNewReview({ rating: review.rating, comment: review.comment || '' });
        setShowAddReview(true);
    };

    const renderStars = (rating, size = 'sm', isInteractive = false, onRatingChange = null) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={`${styles.star} ${size === 'lg' ? styles.starLarge : ''} ${isInteractive ? styles.starInteractive : ''}`}
                    onClick={isInteractive ? () => onRatingChange(i) : undefined}
                >
                    {i <= rating ? <FaStar color="#ffc107" /> : <FaRegStar color="#ddd" />}
                </span>
            );
        }
        return stars;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className={styles.reviewsContainer}>
            <h6 className="text-black fw-medium mb-3">Đánh giá bài viết</h6>

            {/* Thống kê đánh giá */}
            <div className={styles.statsContainer}>
                <div className={styles.averageRating}>
                    <div className={styles.ratingNumber}>{stats.averageRating.toFixed(1)}</div>
                    <div className={styles.starsContainer}>
                        {renderStars(Math.round(stats.averageRating), 'lg')}
                    </div>
                    <div className={styles.totalReviews}>({stats.totalReviews} đánh giá)</div>
                </div>

                <div className={styles.ratingBars}>
                    {[5, 4, 3, 2, 1].map(rating => (
                        <div key={rating} className={styles.ratingBar}>
                            <span>{rating} sao</span>
                            <div className={styles.barContainer}>
                                <div
                                    className={styles.bar}
                                    style={{
                                        width: stats.totalReviews > 0
                                            ? `${(stats.ratingCounts[rating] || 0) / stats.totalReviews * 100}%`
                                            : '0%'
                                    }}
                                ></div>
                            </div>
                            <span>({stats.ratingCounts[rating] || 0})</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Nút thêm đánh giá */}
            {currentUserId && !hasReviewed && (
                <button
                    className={`btn btn-primary mb-3 ${styles.addReviewBtn}`}
                    onClick={() => setShowAddReview(!showAddReview)}
                >
                    Viết đánh giá
                </button>
            )}

            {/* Form thêm/sửa đánh giá */}
            {showAddReview && (
                <div className={styles.addReviewForm}>
                    <form onSubmit={handleSubmitReview}>
                        <div className="mb-3">
                            <label className="form-label">Đánh giá của bạn:</label>
                            <div className={styles.ratingInput}>
                                {renderStars(newReview.rating, 'lg', true, (rating) =>
                                    setNewReview(prev => ({ ...prev, rating }))
                                )}
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Nhận xét:</label>
                            <textarea
                                className="form-control"
                                rows="4"
                                value={newReview.comment}
                                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                placeholder="Chia sẻ trải nghiệm của bạn về bài viết này..."
                            />
                        </div>
                        <div className={styles.formActions}>
                            <button
                                type="submit"
                                className="btn btn-primary me-2"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : (editingReview ? 'Cập nhật' : 'Gửi đánh giá')}
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowAddReview(false);
                                    setEditingReview(null);
                                    setNewReview({ rating: 5, comment: '' });
                                }}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Danh sách đánh giá */}
            <div className={styles.reviewsList}>
                {reviews.length === 0 ? (
                    <p className="text-muted">Chưa có đánh giá nào cho bài viết này.</p>
                ) : (
                    reviews.map(review => (
                        <div key={review.id} className={styles.reviewItem}>
                            <div className={styles.reviewHeader}>
                                <div className={styles.userInfo}>
                                    {review.userAvatar ? (
                                        <img src={review.userAvatar} alt={review.userName} className={styles.userAvatar} />
                                    ) : (
                                        <div className={styles.defaultAvatar}>
                                            <FaUser />
                                        </div>
                                    )}
                                    <div>
                                        <div className={styles.userName}>{review.userName}</div>
                                        <div className={styles.reviewDate}>{formatDate(review.createdAt)}</div>
                                    </div>
                                </div>
                                <div className={styles.reviewActions}>
                                    <div className={styles.starsContainer}>
                                        {renderStars(review.rating)}
                                    </div>
                                    {currentUserId === review.userId && (
                                        <div className={styles.actionButtons}>
                                            <button
                                                className={`btn btn-sm btn-outline-primary ${styles.actionBtn}`}
                                                onClick={() => handleEditReview(review)}
                                                title="Chỉnh sửa"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className={`btn btn-sm btn-outline-danger ${styles.actionBtn}`}
                                                onClick={() => handleDeleteReview(review.id)}
                                                title="Xóa"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {review.comment && (
                                <div className={styles.reviewComment}>
                                    {review.comment}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default JobPostReviews;
