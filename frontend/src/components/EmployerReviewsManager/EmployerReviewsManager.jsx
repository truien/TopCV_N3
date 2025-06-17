import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Badge,
  Button,
  Modal,
  Pagination,
  Form,
  InputGroup,
  Container,
} from "react-bootstrap";
import {
  FaStar,
  FaRegStar,
  FaUser,
  FaSearch,
  FaFilter,
  FaEye,
  FaChartBar,
  FaClipboardList,
  FaBuilding,
  FaChartPie,
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  getEmployerReviews,
  getEmployerJobPostReviews,
  getEmployerReviewsStats,
} from "@/api/jobPostReviewsApi";
import styles from "./EmployerReviewsManager.module.css";

const EmployerReviewsManager = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: {},
    jobPostsWithReviews: 0,
    recentReviews: [],
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedJobPost, setSelectedJobPost] = useState(null);
  const [showJobPostModal, setShowJobPostModal] = useState(false);
  const [jobPostReviews, setJobPostReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");
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
      console.error("Error fetching stats:", error);
      toast.error("Lỗi khi tải thống kê đánh giá");
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getEmployerReviews(currentPage, pageSize);
      setReviews(data.reviews || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Lỗi khi tải danh sách đánh giá");
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
      console.error("Error fetching job post reviews:", error);
      toast.error("Lỗi khi tải đánh giá bài viết");
    }
  };

  const renderStars = (rating, size = "sm") => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={styles.star}>
          {i <= rating ? (
            <FaStar
              className={`text-warning ${
                size === "lg" ? styles.starLarge : ""
              }`}
            />
          ) : (
            <FaRegStar
              className={`text-muted ${size === "lg" ? styles.starLarge : ""}`}
            />
          )}
        </span>
      );
    }
    return stars;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.jobPostTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating =
      filterRating === "all" || review.rating.toString() === filterRating;

    return matchesSearch && matchesRating;
  });

  const getRatingBadgeVariant = (rating) => {
    if (rating >= 4.5) return "success";
    if (rating >= 3.5) return "primary";
    if (rating >= 2.5) return "warning";
    return "danger";
  };

  return (
    <Container fluid className={styles.container}>
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className={styles.title}>
              <FaClipboardList className="me-2" />
              Quản lý đánh giá bài viết
            </h2>
            <Badge bg="primary" pill className="fs-6 px-3 py-2">
              {stats.totalReviews} đánh giá
            </Badge>
          </div>
          <p className="text-muted">
            Theo dõi và quản lý đánh giá từ người dùng về các bài viết tuyển
            dụng của bạn
          </p>
        </Card.Body>
      </Card>

      {/* Thống kê tổng quan */}
      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className={`${styles.statsCard} shadow-sm border-0 h-100`}>
            <Card.Body className="text-center p-4">
              <div
                className={`${styles.iconWrapper} mb-3 bg-primary bg-opacity-10 text-primary`}
              >
                <FaChartBar size={24} />
              </div>
              <h4 className={styles.statsNumber}>{stats.totalReviews}</h4>
              <p className={`${styles.statsLabel} mb-0`}>Tổng đánh giá</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className={`${styles.statsCard} shadow-sm border-0 h-100`}>
            <Card.Body className="text-center p-4">
              <div
                className={`${styles.iconWrapper} mb-3 bg-warning bg-opacity-10 text-warning`}
              >
                <FaStar size={24} />
              </div>
              <h4 className={styles.statsNumber}>
                <Badge
                  bg={getRatingBadgeVariant(stats.averageRating)}
                  className="p-2"
                >
                  {stats.averageRating.toFixed(1)}/5
                </Badge>
              </h4>
              <div className="mt-2">
                {renderStars(Math.round(stats.averageRating), "lg")}
              </div>
              <p className={`${styles.statsLabel} mb-0 mt-2`}>
                Đánh giá trung bình
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className={`${styles.statsCard} shadow-sm border-0 h-100`}>
            <Card.Body className="text-center p-4">
              <div
                className={`${styles.iconWrapper} mb-3 bg-success bg-opacity-10 text-success`}
              >
                <FaBuilding size={24} />
              </div>
              <h4 className={styles.statsNumber}>
                {stats.jobPostsWithReviews}
              </h4>
              <p className={`${styles.statsLabel} mb-0`}>
                Bài viết có đánh giá
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className={`${styles.statsCard} shadow-sm border-0 h-100`}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div
                  className={`${styles.iconWrapper} bg-info bg-opacity-10 text-info me-2`}
                >
                  <FaChartPie size={24} />
                </div>
                <h6 className={`${styles.statsLabel} mb-0`}>
                  Phân bố đánh giá:
                </h6>
              </div>
              {Object.entries(stats.ratingDistribution || {}).map(
                ([rating, count]) => (
                  <div
                    key={rating}
                    className={`${styles.ratingDistribution} d-flex align-items-center justify-content-between mb-2`}
                  >
                    <div className="d-flex align-items-center">
                      <span className="me-1">{rating}</span>
                      <FaStar className="text-warning" />
                    </div>
                    <div className="d-flex align-items-center">
                      <div className={styles.ratingBar}>
                        <div
                          className={styles.ratingBarFill}
                          style={{
                            width: `${Math.min(
                              100,
                              (count / stats.totalReviews) * 100
                            )}%`,
                            backgroundColor:
                              parseInt(rating) >= 4
                                ? "#28a745"
                                : parseInt(rating) >= 3
                                ? "#17a2b8"
                                : "#dc3545",
                          }}
                        />
                      </div>
                      <span className={`${styles.ratingCount} ms-2`}>
                        {count}
                      </span>
                    </div>
                  </div>
                )
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4 shadow-sm border-0">
        <Card.Header className="bg-white py-3">
          <h5 className="mb-0">
            <FaSearch className="me-2 text-primary" />
            Tìm kiếm và lọc
          </h5>
        </Card.Header>
        <Card.Body className="pt-3 pb-4">
          <Row className="g-3">
            <Col md={6}>
              <InputGroup className="shadow-sm">
                <InputGroup.Text className="bg-white border-end-0">
                  <FaSearch className="text-primary" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm theo tên bài viết, người đánh giá, nội dung..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0 py-2"
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <InputGroup className="shadow-sm">
                <InputGroup.Text className="bg-white border-end-0">
                  <FaStar className="text-warning" />
                </InputGroup.Text>
                <Form.Select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="border-start-0 py-2"
                >
                  <option value="all">Tất cả đánh giá</option>
                  <option value="5">5 sao</option>
                  <option value="4">4 sao</option>
                  <option value="3">3 sao</option>
                  <option value="2">2 sao</option>
                  <option value="1">1 sao</option>
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={3} className="d-flex justify-content-end">
              <Button
                variant="primary"
                onClick={fetchReviews}
                className="w-100 shadow-sm py-2"
              >
                <FaFilter className="me-2" />
                Làm mới
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Danh sách đánh giá */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FaClipboardList className="me-2 text-primary" />
            Danh sách đánh giá
            <Badge bg="secondary" pill className="ms-2">
              {filteredReviews.length}
            </Badge>
          </h5>
          <div className="d-flex align-items-center">
            <small className="text-muted me-2">Cập nhật mới nhất:</small>
            <Badge bg="light" text="dark" className="px-2 py-1">
              {new Date().toLocaleDateString("vi-VN")}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5">
              <div
                className="spinner-border text-primary"
                role="status"
                style={{ width: "3rem", height: "3rem" }}
              >
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-4 text-muted fs-5">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className={styles.reviewTable}>
                  <thead className="bg-light">
                    <tr>
                      <th className="py-3">Bài viết</th>
                      <th className="py-3">Người đánh giá</th>
                      <th className="py-3">Đánh giá</th>
                      <th className="py-3">Nội dung</th>
                      <th className="py-3">Ngày tạo</th>
                      <th className="py-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.length > 0 ? (
                      filteredReviews.map((review) => (
                        <tr key={review.id}>
                          <td>
                            <div className={styles.jobPostTitle}>
                              {review.jobPostTitle || "N/A"}
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
                              <span className="ms-2 fw-medium">
                                {review.userName}
                              </span>
                            </div>
                          </td>
                          <td>
                            <Badge
                              bg={getRatingBadgeVariant(review.rating)}
                              pill
                              className="px-2 py-1 me-2"
                            >
                              {review.rating}/5
                            </Badge>
                            {renderStars(review.rating)}
                          </td>
                          <td>
                            <div className={styles.reviewComment}>
                              {review.comment ? (
                                review.comment.length > 100 ? (
                                  review.comment.substring(0, 100) + "..."
                                ) : (
                                  review.comment
                                )
                              ) : (
                                <em className="text-muted">
                                  Không có nhận xét
                                </em>
                              )}
                            </div>
                          </td>
                          <td>
                            <small className="text-muted">
                              {formatDate(review.createdAt)}
                            </small>
                          </td>
                          <td className="text-center">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="rounded-pill shadow-sm"
                              onClick={() =>
                                fetchJobPostReviews(
                                  review.jobPostId,
                                  review.jobPostTitle
                                )
                              }
                              title="Xem tất cả đánh giá của bài viết này"
                            >
                              <FaEye className="me-1" /> Xem chi tiết
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-5">
                          <div className={styles.emptyState}>
                            <FaClipboardList
                              size={50}
                              className="mb-3 text-muted"
                            />
                            <h5 className="fw-bold mb-3">
                              Không có đánh giá nào
                            </h5>
                            <p className="mb-4">
                              Không tìm thấy đánh giá phù hợp với tiêu chí tìm
                              kiếm
                            </p>
                            <Button
                              variant="outline-primary"
                              onClick={() => {
                                setSearchTerm("");
                                setFilterRating("all");
                                fetchReviews();
                              }}
                              className="rounded-pill px-4"
                            >
                              <FaFilter className="me-2" /> Xóa bộ lọc
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center py-4 px-4">
                  <div className="text-muted">
                    Hiển thị{" "}
                    <span className="fw-bold">{filteredReviews.length}</span>{" "}
                    kết quả
                  </div>
                  <Pagination className="shadow-sm mb-0">
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
        className={styles.reviewModal}
      >
        <Modal.Header closeButton className="border-0 pb-0 bg-light">
          <Modal.Title className="fs-5">
            <FaClipboardList className="me-2 text-primary" />
            Đánh giá cho bài viết:
            <span className="fw-bold ms-2 text-primary">
              {selectedJobPost?.title}
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {jobPostReviews.length > 0 ? (
            <div className={styles.reviewsList}>
              {jobPostReviews.map((review) => (
                <Card
                  key={review.id}
                  className={`${styles.reviewItem} mb-3 border-0 shadow-sm`}
                >
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center">
                        {review.userAvatar ? (
                          <img
                            src={review.userAvatar}
                            alt={review.userName}
                            className={styles.userAvatarLarge}
                          />
                        ) : (
                          <div className={styles.defaultAvatarLarge}>
                            <FaUser />
                          </div>
                        )}
                        <div className="ms-3">
                          <h6 className="mb-1 fw-bold">{review.userName}</h6>
                          <div className="d-flex align-items-center">
                            <Badge
                              bg={getRatingBadgeVariant(review.rating)}
                              pill
                              className="me-2"
                            >
                              {review.rating}/5
                            </Badge>
                            {renderStars(review.rating)}
                          </div>
                        </div>
                      </div>
                      <small className="text-muted">
                        {formatDate(review.createdAt)}
                      </small>
                    </div>
                    {review.comment && (
                      <div
                        className={`${styles.reviewComment} bg-light p-3 rounded`}
                      >
                        {review.comment}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted py-5">
              <div className={styles.emptyState}>
                <FaClipboardList size={50} className="mb-3 text-muted" />
                <h5 className="fw-bold mb-3">Chưa có đánh giá</h5>
                <p className="mb-0">
                  Bài viết này chưa nhận được đánh giá nào từ người dùng
                </p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="secondary"
            onClick={() => setShowJobPostModal(false)}
            className="px-4 rounded-pill shadow-sm"
          >
            <i className="fas fa-times me-2"></i> Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EmployerReviewsManager;
