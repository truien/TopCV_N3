import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge, Button, Modal, Pagination, Form, InputGroup } from 'react-bootstrap';
import { FaStar, FaRegStar, FaUser, FaSearch, FaFilter, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
    getEmployerReviews,
    getEmployerJobPostReviews,
    getEmployerReviewsStats
} from '@/api/jobPostReviewsApi';
import styles from './EmployerReviewsManager.module.css';

const EmployerReviewsManager = () => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {},
        jobPostsWithReviews: 0,
        recentReviews: []
    });
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedJobPost, setSelectedJobPost] = useState(null);
    const [showJobPostModal, setShowJobPostModal] = useState(false);
    const [jobPostReviews, setJobPostReviews] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRating, setFilterRating] = useState('all');
    const pageSize = 10;

    useEffect(() => {
        fetchStats();
        fetchReviews();
    }, [currentPage, searchTerm, filterRating]);

    const fetchStats = async () => {
        try {
            const data = await getEmployerReviewsStats();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Lỗi khi tải thống kê đánh giá');
        }
    };

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const data = await getEmployerReviews(currentPage, pageSize);
            setReviews(data.reviews || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Lỗi khi tải danh sách đánh giá');
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchJobPostReviews = async (jobPostId, jobPostTitle) => {
        try {
            const data = await getEmployerJobPostReviews(jobPostId, 1, 50);
            setJobPostReviews(data.reviews || []);
            setSelectedJobPost({ id: jobPostId, title: jobPostTitle });
            setShowJobPostModal(true);
        } catch (error) {
            console.error('Error fetching job post reviews:', error);
            toast.error('Lỗi khi tải đánh giá bài viết');
        }
    };

    const renderStars = (rating, size = 'sm') => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={styles.star}>
                    {i <= rating ?
                        <FaStar className={`text-warning ${size === 'lg' ? styles.starLarge : ''}`} /> :
                        <FaRegStar className={`text-muted ${size === 'lg' ? styles.starLarge : ''}`} />
                    }
                </span>
            );
        }
        return stars;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredReviews = reviews.filter(review => {
        const matchesSearch = review.jobPostTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.comment?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRating = filterRating === 'all' || review.rating.toString() === filterRating;

        return matchesSearch && matchesRating;
    });

    return (
        <div className={styles.container}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className={styles.title}>Quản lý đánh giá bài viết</h2>
            </div>

            {/* Thống kê tổng quan */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className={styles.statsCard}>
                        <Card.Body className="text-center">
                            <h4 className={styles.statsNumber}>{stats.totalReviews}</h4>
                            <p className={styles.statsLabel}>Tổng đánh giá</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className={styles.statsCard}>
                        <Card.Body className="text-center">
                            <h4 className={styles.statsNumber}>
                                {renderStars(Math.round(stats.averageRating), 'lg')}
                            </h4>
                            <p className={styles.statsLabel}>
                                {stats.averageRating}/5 sao
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className={styles.statsCard}>
                        <Card.Body className="text-center">
                            <h4 className={styles.statsNumber}>{stats.jobPostsWithReviews}</h4>
                            <p className={styles.statsLabel}>Bài viết có đánh giá</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className={styles.statsCard}>
                        <Card.Body>
                            <h6 className={styles.statsLabel}>Phân bố đánh giá:</h6>
                            {Object.entries(stats.ratingDistribution || {}).map(([rating, count]) => (
                                <div key={rating} className={styles.ratingDistribution}>
                                    <span>{rating} sao:</span>
                                    <span className={styles.ratingCount}>{count}</span>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Bộ lọc và tìm kiếm */}
            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FaSearch />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Tìm kiếm theo tên bài viết, người đánh giá, nội dung..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={3}>
                            <Form.Select
                                value={filterRating}
                                onChange={(e) => setFilterRating(e.target.value)}
                            >
                                <option value="all">Tất cả đánh giá</option>
                                <option value="5">5 sao</option>
                                <option value="4">4 sao</option>
                                <option value="3">3 sao</option>
                                <option value="2">2 sao</option>
                                <option value="1">1 sao</option>
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Button variant="outline-primary" onClick={fetchReviews}>
                                <FaFilter className="me-2" />
                                Làm mới
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Danh sách đánh giá */}
            <Card>
                <Card.Header>
                    <h5>Danh sách đánh giá ({filteredReviews.length})</h5>
                </Card.Header>
                <Card.Body>
                    {loading ? (
                        <div className="text-center p-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Table responsive hover>
                                <thead>
                                    <tr>
                                        <th>Bài viết</th>
                                        <th>Người đánh giá</th>
                                        <th>Đánh giá</th>
                                        <th>Nội dung</th>
                                        <th>Ngày tạo</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReviews.length > 0 ? (
                                        filteredReviews.map((review) => (
                                            <tr key={review.id}>
                                                <td>
                                                    <div className={styles.jobPostTitle}>
                                                        {review.jobPostTitle || 'N/A'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        {review.userAvatar ? (
                                                            <img
                                                                src={review.userAvatar}
                                                                alt={review.userName}
                                                                className={styles.userAvatar}
                                                            />
                                                        ) : (
                                                            <div className={styles.defaultAvatar}>
                                                                <FaUser />
                                                            </div>
                                                        )}
                                                        <span className="ms-2">{review.userName}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        {renderStars(review.rating)}
                                                        <span className="ms-2">({review.rating}/5)</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.reviewComment}>
                                                        {review.comment ?
                                                            (review.comment.length > 100 ?
                                                                review.comment.substring(0, 100) + '...' :
                                                                review.comment
                                                            ) :
                                                            <em className="text-muted">Không có nhận xét</em>
                                                        }
                                                    </div>
                                                </td>
                                                <td>
                                                    <small className="text-muted">
                                                        {formatDate(review.createdAt)}
                                                    </small>
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => fetchJobPostReviews(review.jobPostId, review.jobPostTitle)}
                                                        title="Xem tất cả đánh giá của bài viết này"
                                                    >
                                                        <FaEye />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center text-muted py-4">
                                                Không có đánh giá nào
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center mt-4">
                                    <Pagination>
                                        <Pagination.Prev
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                        />
                                        {[...Array(totalPages)].map((_, index) => (
                                            <Pagination.Item
                                                key={index + 1}
                                                active={index + 1 === currentPage}
                                                onClick={() => setCurrentPage(index + 1)}
                                            >
                                                {index + 1}
                                            </Pagination.Item>
                                        ))}
                                        <Pagination.Next
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                        />
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </Card.Body>
            </Card>

            {/* Modal chi tiết đánh giá của bài viết */}
            <Modal
                show={showJobPostModal}
                onHide={() => setShowJobPostModal(false)}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Đánh giá cho bài viết: {selectedJobPost?.title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {jobPostReviews.length > 0 ? (
                        <div className={styles.reviewsList}>
                            {jobPostReviews.map((review) => (
                                <div key={review.id} className={styles.reviewItem}>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div className="d-flex align-items-center">
                                            {review.userAvatar ? (
                                                <img
                                                    src={review.userAvatar}
                                                    alt={review.userName}
                                                    className={styles.userAvatar}
                                                />
                                            ) : (
                                                <div className={styles.defaultAvatar}>
                                                    <FaUser />
                                                </div>
                                            )}
                                            <div className="ms-2">
                                                <strong>{review.userName}</strong>
                                                <div className="d-flex align-items-center mt-1">
                                                    {renderStars(review.rating)}
                                                    <small className="text-muted ms-2">
                                                        {formatDate(review.createdAt)}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <div className={styles.reviewComment}>
                                            {review.comment}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted py-4">
                            Bài viết này chưa có đánh giá nào
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowJobPostModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default EmployerReviewsManager;
