import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
  Pagination,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import {
  FaRegTrashAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaBriefcase,
  FaRegCalendarAlt,
} from "react-icons/fa";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { getSavedJobs, unsaveJob } from "../../api/saveJobApi";
import styles from "./SavedJobs.module.css";

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSavedJobs(currentPage);
  }, [currentPage]);

  const fetchSavedJobs = async (page) => {
    setLoading(true);
    try {
      const response = await getSavedJobs({ page, pageSize: 10 });
      setSavedJobs(response.items || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      setError("Không thể tải danh sách công việc đã lưu.");
      toast.error("Không thể tải danh sách công việc đã lưu.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveJob = async (jobId) => {
    try {
      await unsaveJob(jobId);
      toast.success("Đã xóa công việc khỏi danh sách đã lưu.");
      setSavedJobs(savedJobs.filter((job) => job.id !== jobId));
    } catch (error) {
      toast.error("Không thể xóa công việc khỏi danh sách đã lưu.");
    }
  };

  const renderPagination = () => {
    const items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => setCurrentPage(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    return (
      <Pagination className="justify-content-center mt-4">
        <Pagination.Prev
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        />
        {items}
        <Pagination.Next
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };

  return (
    <>
      <Header />
      <Container className="py-5">
        <h1 className="text-center mb-4">Công Việc Đã Lưu</h1>

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Đang tải danh sách công việc...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : savedJobs.length === 0 ? (
          <Alert variant="info">
            <p className="mb-0">Bạn chưa lưu công việc nào.</p>
            <p className="mt-3 mb-0">
              <Link to="/" className="btn btn-primary">
                Tìm kiếm công việc ngay
              </Link>
            </p>
          </Alert>
        ) : (
          <>
            <Row>
              {savedJobs.map((job) => (
                <Col xs={12} key={job.id} className="mb-4">
                  <Card className={styles.jobCard}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <Link
                            to={`/jobposts/${job.id}`}
                            className="text-decoration-none"
                          >
                            <Card.Title className={styles.jobTitle}>
                              {job.title}
                            </Card.Title>
                          </Link>
                          <Card.Subtitle className="mb-2 text-muted">
                            {job.employer?.companyName}
                          </Card.Subtitle>
                        </div>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleUnsaveJob(job.id)}
                          title="Xóa khỏi danh sách đã lưu"
                        >
                          <FaRegTrashAlt />
                        </Button>
                      </div>
                      <div className="d-flex flex-wrap gap-3 my-3">
                        {job.location && (
                          <div className="d-flex align-items-center">
                            <FaMapMarkerAlt className="text-secondary me-2" />
                            <span>{job.location}</span>
                          </div>
                        )}
                        {job.salaryRange && (
                          <div className="d-flex align-items-center">
                            <FaMoneyBillWave className="text-secondary me-2" />
                            <span>{job.salaryRange}</span>
                          </div>
                        )}
                        {job.employment && job.employment.length > 0 && (
                          <div className="d-flex align-items-center">
                            <FaBriefcase className="text-secondary me-2" />
                            <span>{job.employment.join(", ")}</span>
                          </div>
                        )}
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="d-flex gap-2">
                          {job.fields &&
                            job.fields.map((field, index) => (
                              <Badge
                                key={index}
                                bg="light"
                                text="dark"
                                className="py-2 px-3"
                              >
                                {field}
                              </Badge>
                            ))}
                        </div>
                        <div className="d-flex align-items-center text-muted">
                          <FaRegCalendarAlt className="me-2" />
                          <small>
                            Hạn nộp:{" "}
                            {new Date(job.applyDeadline).toLocaleDateString(
                              "vi-VN"
                            )}
                          </small>
                        </div>
                      </div>{" "}
                      <div className="mt-3">
                        <Link
                          to={`/jobposts/${job.id}`}
                          className="btn btn-outline-primary"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {totalPages > 1 && renderPagination()}
          </>
        )}
      </Container>
      <Footer />
    </>
  );
};

export default SavedJobs;
