import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { Container, Row, Col, Form, Button, Card, Pagination, Badge } from 'react-bootstrap';
import styles from './SearchJob.module.css';
import { searchJobs } from '../../api/jobApi';
import { getAllJobFields } from '../../api/jobFieldsApi';
import { getAllEmploymentTypes } from '../../api/employmentTypesApi';
import { getTopAppliedCompanies } from '../../api/companyApi';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Recommend from '@/components/Recommend/Recommend';
import FeaturedCompanies from '@/components/FeaturedCompanies/FeaturedCompanies.jsx';
import axios from 'axios';

const SearchJob = () => {
    const navigate = useNavigate();
    const [employmentTypes, setEmploymentTypes] = useState([]);
    const [jobFields, setJobFields] = useState([]);
    const [selectedField, setSelectedField] = useState('');
    const [selectedEmploymentType, setSelectedEmploymentType] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedSalary, setSelectedSalary] = useState('');
    const [jobPosts, setJobPosts] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortOption, setSortOption] = useState({ value: '1', label: 'Ngày đăng' });
    const [isLoading, setIsLoading] = useState(false); const [keyword, setKeyword] = useState('');
    const [topCompanies, setTopCompanies] = useState([]);
    const [popularLocations, setPopularLocations] = useState([]);

    // Các lựa chọn sắp xếp
    const sortOptions = [
        { value: 'all', label: 'Đề xuất của AI' },
        { value: '1', label: 'Ngày đăng' },
        { value: '2', label: 'Ngày nộp hồ sơ' },
        { value: '3', label: 'Theo follow công ty' },
        { value: '4', label: 'Theo rating cao nhất' },
    ];

    // Các khoảng lương
    const salaryRanges = [
        { value: '', label: 'Tất cả mức lương' },
        { value: '0-5000000', label: 'Dưới 5 triệu' },
        { value: '5000000-10000000', label: 'Từ 5 - 10 triệu' },
        { value: '10000000-20000000', label: 'Từ 10 - 20 triệu' },
        { value: '20000000-30000000', label: 'Từ 20 - 30 triệu' },
        { value: '30000000-50000000', label: 'Từ 30 - 50 triệu' },
        { value: '50000000-100000000', label: 'Trên 50 triệu' },
    ];

    // Các địa điểm phổ biến
    // const popularLocations = [
    //     'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng',
    //     'Cần Thơ', 'Bình Dương', 'Đồng Nai', 'Bắc Ninh'
    // ];

    useEffect(() => {
        // Lấy query params từ URL
        const queryParams = new URLSearchParams(window.location.search);
        const locationParam = queryParams.get('location');
        const keywordParam = queryParams.get('keyword');

        if (locationParam) {
            setSelectedLocation(locationParam);
        }

        if (keywordParam) {
            setKeyword(keywordParam);
        }

        fetchJobFields();
        fetchEmploymentTypes();
        fetchTopCompanies();
        fetchProvinces();
    }, []);

    const fetchJobFields = async () => {
        try {
            setIsLoading(true);
            const data = await getAllJobFields();
            const formattedFields = data.map(field => ({
                value: field.id.toString(),
                label: field.name
            }));
            setJobFields([{ value: '', label: 'Tất cả ngành nghề' }, ...formattedFields]);
        } catch (error) {
            console.error('Error fetching job fields:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEmploymentTypes = async () => {
        try {
            setIsLoading(true);
            const data = await getAllEmploymentTypes();
            const formattedTypes = data.map(type => ({
                value: type.id.toString(),
                label: type.name
            }));
            setEmploymentTypes([{ value: '', label: 'Tất cả hình thức' }, ...formattedTypes]);
        } catch (error) {
            console.error('Error fetching employment types:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTopCompanies = async () => {
        try {
            const data = await getTopAppliedCompanies(5);
            setTopCompanies(data);
        } catch {
            setTopCompanies([]);
        }
    };
    const fetchProvinces = async () => {
        try {
            const response = await axios("https://open.oapi.vn/location/provinces?page=0&size=63");
            setPopularLocations(response.data.data.map(province => province.name));
        } catch (error) {
            console.error('Error fetching provinces:', error);
        }
    };

    useEffect(() => {
        const loadJobPosts = async () => {
            try {
                setIsLoading(true);

                // Tạo object chứa query params
                const params = {};
                if (keyword) params.keyword = keyword;
                if (selectedField) params.fieldId = selectedField;
                if (selectedEmploymentType) params.employmentTypeId = selectedEmploymentType;
                if (selectedLocation) params.location = selectedLocation;
                if (selectedSalary) {
                    const [min, max] = selectedSalary.split('-');
                    if (min) params.minSalary = min;
                    if (max) params.maxSalary = max;
                }
                params.sortBy = sortOption.value;
                params.page = page.toString();
                params.pageSize = pageSize.toString(); const data = await searchJobs(params);
                console.log("API Response:", data); // Để debug

                // Map dữ liệu để chuyển đổi các trường có thể khác tên
                const processedJobs = (data.items || []).map(job => ({
                    ...job,
                    // Đảm bảo trường highlightType và employerIsPro luôn có (dù viết hoa hay viết thường)
                    highlightType: job.highlightType || job.HighlightType || null,
                    employerIsPro: job.employerIsPro || job.EmployerIsPro || false,
                    // Thêm rating trung bình và follower count
                    averageRating: job.averageRating || job.AverageRating || 0,
                    followerCount: job.followerCount || job.FollowerCount || 0,
                }));

                setJobPosts(processedJobs);
                setTotalCount(data.totalCount || 0);
            } catch (error) {
                console.error('Error fetching job posts:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadJobPosts();
    }, [
        keyword,
        selectedField,
        selectedEmploymentType,
        selectedLocation,
        selectedSalary,
        sortOption,
        page,
        pageSize
    ]);    // Đếm số bộ lọc đang được áp dụng để hiển thị
    const activeFiltersCount = () => {
        let count = 0;
        if (selectedField) count++;
        if (selectedEmploymentType) count++;
        if (selectedLocation) count++;
        if (selectedSalary) count++;
        return count;
    };

    const handleChangeEmploymentType = (selectedOption) => {
        setSelectedEmploymentType(selectedOption.value);
        setPage(1);
    };

    const handleFieldChange = (selectedOption) => {
        setSelectedField(selectedOption.value);
        setPage(1);
    };

    const handleLocationChange = (event) => {
        setSelectedLocation(event.target.value);
        setPage(1);
    };

    const handleSalaryChange = (selectedOption) => {
        setSelectedSalary(selectedOption.value);
        setPage(1);
    };

    const handleSortChange = (selectedOption) => {
        setSortOption(selectedOption);
        setPage(1);
    };

    const handleClearFilters = () => {
        setKeyword('');
        setSelectedField('');
        setSelectedEmploymentType('');
        setSelectedLocation('');
        setSelectedSalary('');
        setSortOption({ value: '1', label: 'Ngày đăng' });
        setPage(1);

        // Cập nhật URL để xóa query params
        navigate('/search-job');
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        // Scroll to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setPage(1);
    };

    const handleJobClick = (jobId) => {
        navigate(`/jobposts/${jobId}`);
    };

    const handleApplyNow = (jobId) => {
        navigate(`/jobposts/${jobId}`);
    };
    const renderPaginationItems = () => {
        const totalPages = Math.ceil(totalCount / pageSize);
        const items = [];

        // Nút Previous
        items.push(
            <Pagination.Prev
                key="prev"
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className={`${styles['fade-in-up']} pagination-prev`}
            >
                <i className="bi bi-chevron-left"></i>
            </Pagination.Prev>
        );

        // Hiển thị tối đa 5 nút trang
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(totalPages, startPage + 4);

        // Nút đầu trang nếu startPage > 1
        if (startPage > 1) {
            items.push(
                <Pagination.Item
                    key="page-1"
                    active={1 === page}
                    onClick={() => handlePageChange(1)}
                    className={`${styles['fade-in-up']} ${styles['staggered-item']}`}
                >
                    1
                </Pagination.Item>
            );

            if (startPage > 2) {
                items.push(
                    <Pagination.Ellipsis key="ellipsis-1" className={styles['fade-in-up']} />
                );
            }
        }

        // Các trang chính
        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <Pagination.Item
                    key={`page-${i}`}
                    active={i === page}
                    onClick={() => handlePageChange(i)}
                    className={`${styles['fade-in-up']} ${styles['staggered-item']}`}
                >
                    {i}
                </Pagination.Item>
            );
        }

        // Nút cuối trang nếu endPage < totalPages
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                items.push(
                    <Pagination.Ellipsis key="ellipsis-2" className={styles['fade-in-up']} />
                );
            }

            items.push(
                <Pagination.Item
                    key={`page-${totalPages}`}
                    active={totalPages === page}
                    onClick={() => handlePageChange(totalPages)}
                    className={`${styles['fade-in-up']} ${styles['staggered-item']}`}
                >
                    {totalPages}
                </Pagination.Item>
            );
        }
        items.push(
            <Pagination.Next
                key="next"
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
                className={`${styles['fade-in-up']} pagination-next`}
            >
                <i className="bi bi-chevron-right"></i>
            </Pagination.Next>
        );

        return items;
    };// Hiển thị trạng thái lọc hiện tại
    const renderActiveFilters = () => {
        const filters = [];

        if (selectedField) {
            const field = jobFields.find(f => f.value === selectedField);
            filters.push(
                <Badge key="field" bg="light" text="dark" className={`me-2 mb-2 p-2 ${styles['animated-badge']}`}>
                    <i className="bi bi-briefcase-fill text-primary me-1"></i>
                    {field?.label}
                    <i className="bi bi-x-circle ms-2" style={{ cursor: 'pointer', fontSize: '12px', opacity: 0.7 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedField('');
                            setPage(1);
                        }}></i>
                </Badge>
            );
        }

        if (selectedEmploymentType) {
            const type = employmentTypes.find(t => t.value === selectedEmploymentType);
            filters.push(
                <Badge key="type" bg="light" text="dark" className={`me-2 mb-2 p-2 ${styles['animated-badge']}`}>
                    <i className="bi bi-clock-fill text-primary me-1"></i>
                    {type?.label}
                    <i className="bi bi-x-circle ms-2" style={{ cursor: 'pointer', fontSize: '12px', opacity: 0.7 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEmploymentType('');
                            setPage(1);
                        }}></i>
                </Badge>
            );
        }

        if (selectedLocation) {
            filters.push(
                <Badge key="location" bg="light" text="dark" className={`me-2 mb-2 p-2 ${styles['animated-badge']}`}>
                    <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                    {selectedLocation}
                    <i className="bi bi-x-circle ms-2" style={{ cursor: 'pointer', fontSize: '12px', opacity: 0.7 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLocation('');
                            setPage(1);
                        }}></i>
                </Badge>
            );
        }

        if (selectedSalary) {
            const salary = salaryRanges.find(s => s.value === selectedSalary);
            filters.push(
                <Badge key="salary" bg="light" text="dark" className={`me-2 mb-2 p-2 ${styles['animated-badge']}`}>
                    <i className="bi bi-cash-coin text-success me-1"></i>
                    {salary?.label}
                    <i className="bi bi-x-circle ms-2" style={{ cursor: 'pointer', fontSize: '12px', opacity: 0.7 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSalary('');
                            setPage(1);
                        }}></i>
                </Badge>
            );
        }

        return filters.length > 0 ? (
            <div className="mt-4 mb-2 animate__animated animate__fadeIn">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="text-muted d-flex align-items-center">
                        <i className="bi bi-funnel-fill me-2" style={{ color: '#00b14f' }}></i>
                        <span style={{ fontWeight: 500 }}>Bộ lọc đang áp dụng ({filters.length}):</span>
                    </div>
                    {filters.length > 1 && (
                        <Button
                            variant="link"
                            size="sm"
                            onClick={handleClearFilters}
                            className="text-danger p-0"
                            style={{ textDecoration: 'none', fontSize: '14px' }}
                        >
                            <i className="bi bi-trash me-1"></i> Xóa tất cả
                        </Button>
                    )}
                </div>
                <div className="d-flex flex-wrap">{filters}</div>
            </div>
        ) : null;
    }; return (
        <>
            <Header />
            <Container fluid className="p-0">
                <div className="py-3 px-3 px-md-5" style={{ borderBottom: "1px solid #eaeaea", background: "linear-gradient(to right, #f8f9fa, #f1f3f5)" }}>
                    <Container>
                        <Row>
                            <Col>
                                <div className="d-flex align-items-center">
                                    <Link to={"/"} className={`${styles['breadcrumb-item']} text-muted d-flex align-items-center`} style={{ fontSize: "0.9rem", cursor: "pointer" }}>
                                        <i className="bi bi-house-door me-1"></i> Trang chủ
                                    </Link>
                                    <i className="bi bi-chevron-right mx-2" style={{ fontSize: "0.7rem", color: "#aaa" }}></i>
                                    <span className={`${styles['breadcrumb-item']} fw-medium`} style={{ fontSize: "0.9rem", color: "#00b14f" }}>
                                        Tìm kiếm việc làm
                                    </span>
                                </div>
                                <p className="mt-2 mb-0 d-flex align-items-center" style={{ color: "#333", fontWeight: "500", fontSize: "1rem" }}>
                                    <i className="bi bi-search-heart me-2" style={{ color: "#00b14f" }}></i>
                                    Tìm thấy <span className="mx-1" style={{ color: "#00b14f", fontWeight: "700", fontSize: "1.1rem" }}>{totalCount}</span> việc làm phù hợp với nhu cầu của bạn
                                </p>
                            </Col>
                        </Row>
                    </Container>
                </div>

                {/* Thêm thanh thông báo tính năng mới */}
                <div className={`py-2 px-3 px-md-5 ${styles['fade-in-up']}`} style={{ background: "linear-gradient(to right, #e6f7ef, #f2fcf8)", borderBottom: "1px solid #d1f3e0" }}>
                    <Container>
                        <Row>
                            <Col>
                                <div className="d-flex align-items-center justify-content-center flex-wrap gap-2">
                                    <span className="badge bg-success rounded-pill px-3 py-2" style={{ fontSize: '13px' }}>
                                        <i className="bi bi-stars me-1"></i> Mới
                                    </span>
                                    <span style={{ fontWeight: '500', fontSize: '14px', color: '#333' }}>
                                        Dùng AI tìm việc phù hợp với CV của bạn!
                                    </span>
                                    <Button
                                        variant="outline-success"
                                        size="sm"
                                        className="rounded-pill d-flex align-items-center ms-2"
                                        style={{
                                            fontSize: '13px',
                                            padding: '4px 12px',
                                            fontWeight: '500',
                                            backgroundColor: 'rgba(255,255,255,0.5)'
                                        }}
                                    >
                                        <i className="bi bi-magic me-1"></i> Tìm bằng AI
                                    </Button>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="ms-auto text-muted p-0 d-none d-md-block"
                                    >
                                        <i className="bi bi-x"></i>
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>

                <Container className="py-4">
                    <Row className="mb-4">
                        <Col lg={12} className="mb-3">
                            <Card className={`mb-3 shadow border-0 ${styles['shadow-hover-card']}`} style={{ borderRadius: '16px', overflow: 'hidden' }}>
                                <Card.Body className="p-4">
                                    <Form.Group>
                                        <div className={`d-flex flex-column flex-md-row align-items-center gap-3 ${styles['search-container']}`}>
                                            <div className="position-relative flex-grow-1 w-100">                                                <div className={`position-absolute ${styles['search-icon-container']}`} style={{ left: '16px', top: '13px', color: '#00b14f', fontSize: '20px' }}>
                                                <i className="bi bi-search"></i>
                                            </div>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Nhập vị trí, công ty, kỹ năng bạn mong muốn..."
                                                    value={keyword}
                                                    onChange={(e) => setKeyword(e.target.value)}
                                                    className={`flex-grow-1 ps-5 shadow-sm ${styles['search-input']}`}
                                                    style={{
                                                        borderRadius: '14px',
                                                        height: '52px',
                                                        border: '1px solid #e0e0e0',
                                                        fontSize: '16px',
                                                        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                                        backgroundColor: '#fafafa'
                                                    }}
                                                    onFocus={(e) => {
                                                        e.target.style.boxShadow = '0 0 0 3px rgba(0, 177, 79, 0.2)';
                                                        e.target.style.backgroundColor = '#fff';
                                                        e.target.style.borderColor = '#00b14f';
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.boxShadow = '';
                                                        e.target.style.backgroundColor = '#fafafa';
                                                        e.target.style.borderColor = '#e0e0e0';
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            setPage(1);
                                                            const params = new URLSearchParams();
                                                            if (keyword) params.append('keyword', keyword);
                                                            navigate(`/search-job${params.toString() ? '?' + params.toString() : ''}`);
                                                        }
                                                    }}
                                                />
                                                {keyword && (
                                                    <Button
                                                        variant="link"
                                                        className="position-absolute p-0"
                                                        style={{ right: '15px', top: '12px', color: '#888', fontSize: '16px', transition: 'all 0.2s ease' }}
                                                        onClick={() => setKeyword('')}
                                                        onMouseOver={(e) => e.target.style.color = '#dc3545'}
                                                        onMouseOut={(e) => e.target.style.color = '#888'}
                                                    >
                                                        <i className="bi bi-x-circle-fill"></i>
                                                    </Button>
                                                )}
                                            </div>
                                            <Button
                                                variant="success"
                                                className={`px-4 py-2 d-flex align-items-center justify-content-center ${styles['search-btn']}`}
                                                style={{
                                                    borderRadius: '14px',
                                                    height: '52px',
                                                    minWidth: '150px',
                                                    backgroundColor: '#00b14f',
                                                    border: 'none',
                                                    fontWeight: '600',
                                                    fontSize: '16px',
                                                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                                    boxShadow: '0 4px 10px rgba(0, 177, 79, 0.25)',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.target.style.backgroundColor = '#009f47';
                                                    e.target.style.transform = 'translateY(-2px)';
                                                    e.target.style.boxShadow = '0 6px 15px rgba(0, 177, 79, 0.35)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.target.style.backgroundColor = '#00b14f';
                                                    e.target.style.transform = 'translateY(0)';
                                                    e.target.style.boxShadow = '0 4px 10px rgba(0, 177, 79, 0.25)';
                                                }}
                                                onClick={() => {
                                                    // Create ripple effect
                                                    const button = document.querySelector(`.${styles['search-btn']}`);
                                                    const circle = document.createElement('span');
                                                    const diameter = Math.max(button.clientWidth, button.clientHeight);

                                                    circle.style.width = circle.style.height = `${diameter}px`;
                                                    circle.style.left = `${event.clientX - button.getBoundingClientRect().left - diameter / 2}px`;
                                                    circle.style.top = `${event.clientY - button.getBoundingClientRect().top - diameter / 2}px`;
                                                    circle.classList.add(styles['btn-ripple']);

                                                    const ripple = button.getElementsByClassName(styles['btn-ripple'])[0];
                                                    if (ripple) {
                                                        ripple.remove();
                                                    }

                                                    button.appendChild(circle);

                                                    // Navigate
                                                    setPage(1);
                                                    const params = new URLSearchParams();
                                                    if (keyword) params.append('keyword', keyword);
                                                    navigate(`/search-job${params.toString() ? '?' + params.toString() : ''}`);
                                                }}
                                            >
                                                <i className="bi bi-search-heart me-2"></i>
                                                Tìm kiếm
                                            </Button>
                                        </div>
                                        {keyword && (
                                            <div className="mt-3 text-muted small d-flex align-items-center animate__animated animate__fadeIn">
                                                <span className="bg-light py-1 px-3 rounded-pill">
                                                    <i className="bi bi-info-circle me-1" style={{ color: '#00b14f' }}></i>
                                                    Đang tìm kiếm: <strong className={styles['search-highlight']} style={{ color: '#00b14f', fontWeight: '600' }}>"{keyword}"</strong>
                                                </span>
                                            </div>
                                        )}

                                        {renderActiveFilters()}
                                    </Form.Group>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={3}>
                            <Card className={`mb-4 border-0 shadow ${styles['shadow-hover-card']} ${styles['modern-card']}`} style={{ borderRadius: '16px', position: 'sticky', top: '20px' }}>
                                <Card.Header className="bg-white border-bottom py-3" style={{ borderRadius: '16px 16px 0 0' }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0 d-flex align-items-center" style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                                            <div className={`${styles['filter-icon']} me-2`}>
                                                <i className="bi bi-sliders"></i>
                                            </div>
                                            Lọc nâng cao
                                            {activeFiltersCount() > 0 && (
                                                <Badge pill bg="success" className="ms-2 animate__animated animate__fadeIn"
                                                    style={{
                                                        backgroundColor: '#00b14f',
                                                        boxShadow: '0 2px 6px rgba(0, 177, 79, 0.3)',
                                                        fontWeight: '500',
                                                        fontSize: '12px',
                                                        padding: '5px 8px'
                                                    }}>
                                                    {activeFiltersCount()}
                                                </Badge>
                                            )}
                                        </h5>
                                        {activeFiltersCount() > 0 && (<Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={handleClearFilters}
                                            className="d-flex align-items-center rounded-pill shadow-sm"
                                            style={{
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                borderWidth: '1.5px',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                                                e.target.style.boxShadow = '0 4px 8px rgba(220, 53, 69, 0.2)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.backgroundColor = 'transparent';
                                                e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                                            }}
                                        >
                                            <i className="bi bi-trash me-1"></i> Xóa bộ lọc
                                        </Button>
                                        )}
                                    </div>
                                </Card.Header>
                                <Card.Body className={`p-4 ${styles['filter_body']}`} style={{ borderRadius: '0 0 16px 16px' }}
                                >
                                    <div className={`mb-4 ${styles['filter-section']}`}>
                                        <div className="mb-3 d-flex align-items-center" style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>
                                            <div className={`${styles['filter-icon']} me-2`} style={{ backgroundColor: 'rgba(0, 177, 79, 0.1)', color: '#00b14f' }}>
                                                <i className="bi bi-briefcase"></i>
                                            </div>
                                            Ngành nghề
                                        </div>
                                        <div>
                                            <Select
                                                value={jobFields.find(option => option.value === selectedField)}
                                                onChange={handleFieldChange}
                                                options={jobFields}
                                                placeholder="Chọn ngành nghề..."
                                                isSearchable
                                                isClearable
                                                className={`rounded-select ${styles['select-enhanced']}`}
                                                classNamePrefix="select-filter"
                                                menuPlacement="auto"
                                                menuPosition="fixed"
                                                styles={{
                                                    control: (provided, state) => ({
                                                        ...provided,
                                                        borderColor: state.isFocused ? '#00b14f' : '#e0e0e0',
                                                        boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(0, 177, 79, 0.25)' : 'none',
                                                        borderRadius: '12px',
                                                        minHeight: '45px',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: 'white',
                                                        '&:hover': {
                                                            borderColor: '#00b14f'
                                                        }
                                                    }),
                                                    option: (provided, state) => ({
                                                        ...provided,
                                                        backgroundColor: state.isSelected ? '#00b14f' : state.isFocused ? '#e6f7ef' : 'white',
                                                        color: state.isSelected ? 'white' : '#333',
                                                        fontSize: '14px',
                                                        padding: '10px 12px'
                                                    }),
                                                    menu: (provided) => ({
                                                        ...provided,
                                                        zIndex: 9999,
                                                        borderRadius: '12px',
                                                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                                        overflow: 'hidden',
                                                        backgroundColor: 'white',
                                                        animation: 'fadeIn 0.25s ease',
                                                        border: '1px solid #f0f0f0'
                                                    }),
                                                    menuPortal: (provided) => ({
                                                        ...provided,
                                                        zIndex: 9999
                                                    }),
                                                    placeholder: (provided) => ({
                                                        ...provided,
                                                        color: '#aaa',
                                                        fontSize: '14px'
                                                    }),
                                                    indicatorSeparator: () => ({
                                                        display: 'none'
                                                    }),
                                                    dropdownIndicator: (provided) => ({
                                                        ...provided,
                                                        color: '#00b14f'
                                                    }),
                                                    valueContainer: (provided) => ({
                                                        ...provided,
                                                        padding: '2px 12px',
                                                    }),
                                                    input: (provided) => ({
                                                        ...provided,
                                                        margin: '2px',
                                                    })
                                                }}
                                                menuPortalTarget={document.body}
                                            />
                                            {selectedField && (
                                                <div className="mt-2 small animate__animated animate__fadeIn" style={{ color: '#00b14f', fontSize: '13px' }}>
                                                    <i className="bi bi-check-circle-fill me-1"></i>
                                                    <span style={{ fontWeight: '500' }}>Đã chọn:</span> {jobFields.find(option => option.value === selectedField)?.label}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`mb-4 ${styles['filter-section']}`}>
                                        <div className="mb-3 d-flex align-items-center" style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>
                                            <div className={`${styles['filter-icon']} me-2`} style={{ backgroundColor: 'rgba(13, 110, 253, 0.1)', color: '#0d6efd' }}>
                                                <i className="bi bi-clock-history"></i>
                                            </div>
                                            Hình thức làm việc
                                        </div>
                                        <div>
                                            <Select
                                                value={employmentTypes.find(option => option.value === selectedEmploymentType)}
                                                onChange={handleChangeEmploymentType}
                                                options={employmentTypes}
                                                placeholder="Chọn hình thức làm việc..."
                                                isSearchable
                                                isClearable
                                                className={`rounded-select ${styles['select-enhanced']}`}
                                                classNamePrefix="select-filter"
                                                menuPlacement="auto"
                                                menuPosition="fixed"
                                                styles={{
                                                    control: (provided, state) => ({
                                                        ...provided,
                                                        borderColor: state.isFocused ? '#00b14f' : '#e0e0e0',
                                                        boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(0, 177, 79, 0.25)' : 'none',
                                                        borderRadius: '12px',
                                                        minHeight: '45px',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: 'white',
                                                        '&:hover': {
                                                            borderColor: '#00b14f'
                                                        }
                                                    }),
                                                    option: (provided, state) => ({
                                                        ...provided,
                                                        backgroundColor: state.isSelected ? '#00b14f' : state.isFocused ? '#e6f7ef' : 'white',
                                                        color: state.isSelected ? 'white' : '#333',
                                                        fontSize: '14px',
                                                        padding: '10px 12px'
                                                    }),
                                                    menu: (provided) => ({
                                                        ...provided,
                                                        zIndex: 9999,
                                                        borderRadius: '12px',
                                                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                                        overflow: 'hidden',
                                                        backgroundColor: 'white',
                                                        animation: 'fadeIn 0.25s ease',
                                                        border: '1px solid #f0f0f0'
                                                    }),
                                                    menuPortal: (provided) => ({
                                                        ...provided,
                                                        zIndex: 9999
                                                    }),
                                                    placeholder: (provided) => ({
                                                        ...provided,
                                                        color: '#aaa',
                                                        fontSize: '14px'
                                                    }),
                                                    indicatorSeparator: () => ({
                                                        display: 'none'
                                                    }),
                                                    dropdownIndicator: (provided) => ({
                                                        ...provided,
                                                        color: '#00b14f'
                                                    }),
                                                    valueContainer: (provided) => ({
                                                        ...provided,
                                                        padding: '2px 12px',
                                                    }),
                                                    input: (provided) => ({
                                                        ...provided,
                                                        margin: '2px',
                                                    })
                                                }}
                                                menuPortalTarget={document.body}
                                            />
                                            {selectedEmploymentType && (
                                                <div className="mt-2 small animate__animated animate__fadeIn" style={{ color: '#00b14f', fontSize: '13px' }}>
                                                    <i className="bi bi-check-circle-fill me-1"></i>
                                                    <span style={{ fontWeight: '500' }}>Đã chọn:</span> {employmentTypes.find(option => option.value === selectedEmploymentType)?.label}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className={`mb-4 ${styles['filter-section']}`}>
                                        <div className="mb-3 d-flex align-items-center" style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>
                                            <div className={`${styles['filter-icon']} me-2`} style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#dc3545' }}>
                                                <i className="bi bi-geo-alt-fill"></i>
                                            </div>
                                            Địa điểm làm việc
                                        </div>
                                        <div className="position-relative">
                                            <Form.Select
                                                value={selectedLocation}
                                                onChange={handleLocationChange}
                                                className={`border-0 shadow-sm ${styles['custom-select']}`}
                                                style={{
                                                    borderRadius: '12px',
                                                    borderColor: '#e0e0e0',
                                                    fontSize: '14px',
                                                    height: '45px',
                                                    paddingLeft: '12px',
                                                    transition: 'all 0.25s ease',
                                                    appearance: 'none',
                                                    backgroundColor: 'white',
                                                    backgroundImage: 'none',
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.target.style.borderColor = '#00b14f';
                                                    e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.05)';
                                                }}
                                                onMouseOut={(e) => {
                                                    if (!e.target.matches(':focus')) {
                                                        e.target.style.borderColor = '#e0e0e0';
                                                        e.target.style.boxShadow = '0 2px 5px rgba(0,0,0,0.03)';
                                                    }
                                                }}
                                                onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(0, 177, 79, 0.2)'}
                                                onBlur={(e) => e.target.style.boxShadow = '0 2px 5px rgba(0,0,0,0.03)'}
                                            >
                                                <option value="">Tất cả địa điểm</option>
                                                {popularLocations.map((location, index) => (
                                                    <option key={index} value={location}>{location}</option>
                                                ))}
                                            </Form.Select>
                                            <div className="position-absolute" style={{ top: '10px', right: '14px', pointerEvents: 'none', color: '#00b14f' }}>
                                                <i className="bi bi-geo-alt me-1" style={{ fontSize: '14px', opacity: 0.7 }}></i>
                                                <i className="bi bi-chevron-down" style={{ fontSize: '14px', transition: 'all 0.2s ease' }}></i>
                                            </div>
                                        </div>
                                        {selectedLocation && (
                                            <div className="mt-2 small animate__animated animate__fadeIn" style={{ color: '#00b14f', fontSize: '13px' }}>
                                                <i className="bi bi-check-circle-fill me-1"></i>
                                                <span style={{ fontWeight: '500' }}>Đã chọn:</span> {selectedLocation}
                                            </div>
                                        )}
                                        <div className="mt-3">
                                            <div className="d-flex flex-wrap gap-1">                                            {popularLocations.slice(0, 5).map((location, index) => (<span
                                                key={index}
                                                className={`badge rounded-pill px-3 py-2 ${selectedLocation === location
                                                    ? 'bg-light border border-success text-success animate__animated animate__pulse'
                                                    : 'bg-light text-secondary hover-effect'
                                                    } ${styles['location-badge']}`}
                                                style={{
                                                    fontSize: '13px',
                                                    fontWeight: selectedLocation === location ? '500' : '400',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    margin: '3px',
                                                    boxShadow: selectedLocation === location ? '0 3px 10px rgba(0, 177, 79, 0.2)' : '0 2px 5px rgba(0,0,0,0.03)',
                                                    animationDuration: '3s',
                                                    animationIterationCount: 'infinite'
                                                }}
                                                onClick={() => {
                                                    setSelectedLocation(location);
                                                    setPage(1);
                                                }}
                                                onMouseOver={(e) => {
                                                    if (selectedLocation !== location) {
                                                        e.target.style.backgroundColor = '#f0f9f4';
                                                        e.target.style.color = '#00b14f';
                                                        e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                                                    }
                                                }}
                                                onMouseOut={(e) => {
                                                    if (selectedLocation !== location) {
                                                        e.target.style.backgroundColor = '#f8f9fa';
                                                        e.target.style.color = '#6c757d';
                                                        e.target.style.boxShadow = 'none';
                                                    }
                                                }}
                                            >
                                                {location}
                                            </span>
                                            ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`mb-4 ${styles['filter-section']}`}>
                                        <div className="mb-3 d-flex align-items-center" style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>
                                            <div className={`${styles['filter-icon']} me-2`} style={{ backgroundColor: 'rgba(25, 135, 84, 0.1)', color: '#198754' }}>
                                                <i className="bi bi-cash-coin"></i>
                                            </div>
                                            Mức lương
                                        </div>
                                        <div>
                                            <Select
                                                value={salaryRanges.find(option => option.value === selectedSalary)}
                                                onChange={handleSalaryChange}
                                                options={salaryRanges}
                                                placeholder="Chọn mức lương mong muốn..."
                                                isSearchable
                                                isClearable
                                                className={`rounded-select ${styles['select-enhanced']}`}
                                                classNamePrefix="select-filter"
                                                menuPlacement="auto"
                                                menuPosition="fixed"
                                                styles={{
                                                    control: (provided, state) => ({
                                                        ...provided,
                                                        borderColor: state.isFocused ? '#00b14f' : '#e0e0e0',
                                                        boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(0, 177, 79, 0.25)' : 'none',
                                                        borderRadius: '12px',
                                                        minHeight: '45px',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: 'white',
                                                        '&:hover': {
                                                            borderColor: '#00b14f'
                                                        }
                                                    }),
                                                    option: (provided, state) => ({
                                                        ...provided,
                                                        backgroundColor: state.isSelected ? '#00b14f' : state.isFocused ? '#e6f7ef' : 'white',
                                                        color: state.isSelected ? 'white' : '#333',
                                                        fontSize: '14px',
                                                        padding: '10px 12px'
                                                    }),
                                                    menu: (provided) => ({
                                                        ...provided,
                                                        zIndex: 9999,
                                                        borderRadius: '12px',
                                                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                                        overflow: 'hidden',
                                                        backgroundColor: 'white',
                                                        animation: 'fadeIn 0.25s ease',
                                                        border: '1px solid #f0f0f0'
                                                    }),
                                                    menuPortal: (provided) => ({
                                                        ...provided,
                                                        zIndex: 9999
                                                    }),
                                                    placeholder: (provided) => ({
                                                        ...provided,
                                                        color: '#aaa',
                                                        fontSize: '14px'
                                                    }),
                                                    indicatorSeparator: () => ({
                                                        display: 'none'
                                                    }),
                                                    dropdownIndicator: (provided) => ({
                                                        ...provided,
                                                        color: '#00b14f'
                                                    }),
                                                    valueContainer: (provided) => ({
                                                        ...provided,
                                                        padding: '2px 12px',
                                                    }),
                                                    input: (provided) => ({
                                                        ...provided,
                                                        margin: '2px',
                                                    })
                                                }}
                                                menuPortalTarget={document.body}
                                            />
                                            {selectedSalary && (
                                                <div className="mt-2 small animate__animated animate__fadeIn" style={{ color: '#00b14f', fontSize: '13px' }}>
                                                    <i className="bi bi-check-circle-fill me-1"></i>
                                                    <span style={{ fontWeight: '500' }}>Đã chọn:</span> {salaryRanges.find(option => option.value === selectedSalary)?.label}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3">
                                            <div className="d-flex flex-wrap gap-2">                                            <span
                                                className={`badge rounded-pill px-3 py-2 ${selectedSalary === '10000000-20000000' ? 'bg-light border border-success text-success' : 'bg-light text-secondary'}`}
                                                style={{
                                                    fontSize: '13px',
                                                    fontWeight: '400',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    boxShadow: selectedSalary === '10000000-20000000' ? '0 2px 8px rgba(0, 177, 79, 0.2)' : 'none'
                                                }}
                                                onClick={() => {
                                                    setSelectedSalary('10000000-20000000');
                                                    setPage(1);
                                                }}
                                                onMouseOver={(e) => {
                                                    if (selectedSalary !== '10000000-20000000') {
                                                        e.target.style.backgroundColor = '#f0f9f4';
                                                        e.target.style.color = '#00b14f';
                                                        e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                                                    }
                                                }}
                                                onMouseOut={(e) => {
                                                    if (selectedSalary !== '10000000-20000000') {
                                                        e.target.style.backgroundColor = '#f8f9fa';
                                                        e.target.style.color = '#6c757d';
                                                        e.target.style.boxShadow = 'none';
                                                    }
                                                }}
                                            >
                                                10-20 triệu
                                            </span>                                            <span
                                                className={`badge rounded-pill px-3 py-2 ${selectedSalary === '20000000-30000000' ? 'bg-light border border-success text-success' : 'bg-light text-secondary'}`}
                                                style={{
                                                    fontSize: '13px',
                                                    fontWeight: '400',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    boxShadow: selectedSalary === '20000000-30000000' ? '0 2px 8px rgba(0, 177, 79, 0.2)' : 'none'
                                                }}
                                                onClick={() => {
                                                    setSelectedSalary('20000000-30000000');
                                                    setPage(1);
                                                }}
                                                onMouseOver={(e) => {
                                                    if (selectedSalary !== '20000000-30000000') {
                                                        e.target.style.backgroundColor = '#f0f9f4';
                                                        e.target.style.color = '#00b14f';
                                                        e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                                                    }
                                                }}
                                                onMouseOut={(e) => {
                                                    if (selectedSalary !== '20000000-30000000') {
                                                        e.target.style.backgroundColor = '#f8f9fa';
                                                        e.target.style.color = '#6c757d';
                                                        e.target.style.boxShadow = 'none';
                                                    }
                                                }}
                                            >
                                                    20-30 triệu
                                                </span>                                            <span
                                                    className={`badge rounded-pill px-3 py-2 ${selectedSalary === '30000000-50000000' ? 'bg-light border border-success text-success' : 'bg-light text-secondary'}`}
                                                    style={{
                                                        fontSize: '13px',
                                                        fontWeight: '400',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        boxShadow: selectedSalary === '30000000-50000000' ? '0 2px 8px rgba(0, 177, 79, 0.2)' : 'none'
                                                    }}
                                                    onClick={() => {
                                                        setSelectedSalary('30000000-50000000');
                                                        setPage(1);
                                                    }}
                                                    onMouseOver={(e) => {
                                                        if (selectedSalary !== '30000000-50000000') {
                                                            e.target.style.backgroundColor = '#f0f9f4';
                                                            e.target.style.color = '#00b14f';
                                                            e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                                                        }
                                                    }}
                                                    onMouseOut={(e) => {
                                                        if (selectedSalary !== '30000000-50000000') {
                                                            e.target.style.backgroundColor = '#f8f9fa';
                                                            e.target.style.color = '#6c757d';
                                                            e.target.style.boxShadow = 'none';
                                                        }
                                                    }}
                                                >
                                                    30-50 triệu
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 d-grid gap-2">
                                        {/* Nút áp dụng bộ lọc */}
                                        <Button
                                            variant="success"
                                            className={`d-flex align-items-center justify-content-center shadow-sm ${styles['btn-pulse']}`}
                                            onClick={() => setPage(1)}
                                            style={{
                                                borderRadius: '12px',
                                                backgroundColor: '#00b14f',
                                                border: 'none',
                                                height: '46px',
                                                fontWeight: '500',
                                                fontSize: '16px',
                                                transition: 'all 0.3s ease',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.backgroundColor = '#009f47';
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 6px 20px rgba(0, 177, 79, 0.3)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.backgroundColor = '#00b14f';
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                                            }}
                                        >
                                            <i className="bi bi-sliders me-2"></i>
                                            Áp dụng bộ lọc
                                            <div className={styles['btn-ripple']}></div>
                                        </Button>

                                        {activeFiltersCount() > 0 && (
                                            <Button
                                                variant="outline-danger"
                                                className={`d-flex align-items-center justify-content-center mt-2 ${styles['btn-hover-effect']}`}
                                                onClick={handleClearFilters}
                                                style={{
                                                    borderRadius: '12px',
                                                    height: '44px',
                                                    fontWeight: '500',
                                                    borderWidth: '1.5px',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.target.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                                                    e.target.style.color = '#dc3545';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.target.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                <i className="bi bi-x-circle me-2"></i>
                                                Xóa tất cả bộ lọc
                                            </Button>
                                        )}
                                    </div>

                                    {/* Các việc làm phổ biến */}
                                    <Card className={`mt-4 border-0 shadow ${styles['shadow-hover-card']}`} style={{ borderRadius: '16px', overflow: 'hidden' }}>
                                        <Card.Header className="bg-white border-bottom py-3" style={{ borderRadius: '16px 16px 0 0' }}>
                                            <div className="d-flex align-items-center">
                                                <div className={`${styles['filter-icon']} me-2`} style={{ backgroundColor: 'rgba(13, 110, 253, 0.1)', color: '#0d6efd' }}>
                                                    <i className="bi bi-star-fill"></i>
                                                </div>
                                                <h6 className="mb-0" style={{ fontWeight: '600', fontSize: '15px' }}>Việc làm phổ biến</h6>
                                            </div>
                                        </Card.Header>
                                        <Card.Body className="p-3">
                                            <div className="d-flex flex-column gap-2">                                            <div className={`${styles['job-info-tag']} w-100 justify-content-between`}
                                                style={{
                                                    cursor: 'pointer',
                                                    padding: '10px 15px',
                                                    margin: '2px 0',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(0,0,0,0.05)',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onClick={() => {
                                                    setKeyword("frontend developer");
                                                    setPage(1);
                                                }}
                                                onMouseOver={(e) => {
                                                    e.target.style.backgroundColor = 'rgba(0, 177, 79, 0.08)';
                                                    e.target.style.transform = 'translateX(4px)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.target.style.backgroundColor = 'rgba(0,0,0,0.03)';
                                                    e.target.style.transform = 'translateX(0)';
                                                }}
                                            >
                                                <span style={{ fontWeight: '500', fontSize: '14px' }}>Frontend Developer</span>
                                                <i className="bi bi-search"></i>
                                            </div>                                            <div className={`${styles['job-info-tag']} w-100 justify-content-between`}
                                                style={{
                                                    cursor: 'pointer',
                                                    padding: '10px 15px',
                                                    margin: '2px 0',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(0,0,0,0.05)',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onClick={() => {
                                                    setKeyword("marketing");
                                                    setPage(1);
                                                }}
                                                onMouseOver={(e) => {
                                                    e.target.style.backgroundColor = 'rgba(0, 177, 79, 0.08)';
                                                    e.target.style.transform = 'translateX(4px)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.target.style.backgroundColor = 'rgba(0,0,0,0.03)';
                                                    e.target.style.transform = 'translateX(0)';
                                                }}
                                            >
                                                    <span style={{ fontWeight: '500', fontSize: '14px' }}>Marketing</span>
                                                    <i className="bi bi-search"></i>
                                                </div>                                            <div className={`${styles['job-info-tag']} w-100 justify-content-between`}
                                                    style={{
                                                        cursor: 'pointer',
                                                        padding: '10px 15px',
                                                        margin: '2px 0',
                                                        borderRadius: '8px',
                                                        border: '1px solid rgba(0,0,0,0.05)',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onClick={() => {
                                                        setKeyword("fullstack developer");
                                                        setPage(1);
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.target.style.backgroundColor = 'rgba(0, 177, 79, 0.08)';
                                                        e.target.style.transform = 'translateX(4px)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.target.style.backgroundColor = 'rgba(0,0,0,0.03)';
                                                        e.target.style.transform = 'translateX(0)';
                                                    }}
                                                >
                                                    <span style={{ fontWeight: '500', fontSize: '14px' }}>Fullstack Developer</span>
                                                    <i className="bi bi-search"></i>
                                                </div>                                            <div className={`${styles['job-info-tag']} w-100 justify-content-between`}
                                                    style={{
                                                        cursor: 'pointer',
                                                        padding: '10px 15px',
                                                        margin: '2px 0',
                                                        borderRadius: '8px',
                                                        border: '1px solid rgba(0,0,0,0.05)',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onClick={() => {
                                                        setKeyword("sale");
                                                        setPage(1);
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.target.style.backgroundColor = 'rgba(0, 177, 79, 0.08)';
                                                        e.target.style.transform = 'translateX(4px)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.target.style.backgroundColor = 'rgba(0,0,0,0.03)';
                                                        e.target.style.transform = 'translateX(0)';
                                                    }}
                                                >
                                                    <span style={{ fontWeight: '500', fontSize: '14px' }}>Sale</span>
                                                    <i className="bi bi-search"></i>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>

                                    {/* Công ty hàng đầu */}
                                    <Card className={`mt-3 border-0 shadow ${styles['shadow-hover-card']}`} style={{ borderRadius: '16px', overflow: 'hidden' }}>
                                        <Card.Header className="bg-white border-bottom py-3" style={{ borderRadius: '16px 16px 0 0' }}>
                                            <div className="d-flex align-items-center">
                                                <div className={`${styles['filter-icon']} me-2`} style={{ backgroundColor: 'rgba(25, 135, 84, 0.1)', color: '#198754' }}>
                                                    <i className="bi bi-building"></i>
                                                </div>
                                                <h6 className="mb-0" style={{ fontWeight: '600', fontSize: '15px' }}>Công ty hàng đầu</h6>
                                            </div>
                                        </Card.Header>
                                        <Card.Body className="p-3">
                                            <div className="d-flex flex-wrap gap-2">
                                                {topCompanies.length > 0 ? (
                                                    topCompanies.map((company, index) => (
                                                        <div
                                                            key={company.UserId || index}
                                                            className={`badge bg-light text-dark rounded-pill ${styles['badge-hover']}`}
                                                            style={{
                                                                padding: '8px 16px',
                                                                fontSize: '13px',
                                                                cursor: 'pointer',
                                                                border: '1px solid #eee',
                                                                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                                                margin: '4px 4px',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                            onClick={() => {
                                                                setKeyword(company.companyName);
                                                                setPage(1);
                                                            }}
                                                            onMouseOver={(e) => {
                                                                e.target.style.backgroundColor = 'rgba(0, 177, 79, 0.1)';
                                                                e.target.style.color = '#00b14f';
                                                                e.target.style.borderColor = 'rgba(0, 177, 79, 0.3)';
                                                                e.target.style.transform = 'translateY(-2px)';
                                                                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.target.style.backgroundColor = '#f8f9fa';
                                                                e.target.style.color = '#333';
                                                                e.target.style.borderColor = '#eee';
                                                                e.target.style.transform = 'translateY(0)';
                                                                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                                                            }}
                                                        >
                                                            <i className="bi bi-building me-1 text-muted"></i> {company.companyName}
                                                            <span className="ms-2 badge bg-success bg-opacity-10 text-success">{company.applicationCount}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-muted">Không có dữ liệu công ty nổi bật</span>
                                                )}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={9}>
                            <Card className={`border-0 shadow ${styles['shadow-hover-card']} ${styles['modern-card']}`} style={{ borderRadius: '16px', overflow: 'hidden' }}>
                                <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center py-3 px-4"
                                    style={{
                                        borderRadius: '16px 16px 0 0',
                                        background: 'linear-gradient(to right, #fbfffb, #fff)',
                                        borderBottom: '1px solid #f0f0f0',
                                    }}>
                                    <div className="d-flex align-items-center">
                                        <div className={`${styles['filter-icon']} me-2`}
                                            style={{
                                                backgroundColor: '#e6f7ef',
                                                color: '#00b14f',
                                                boxShadow: '0 3px 10px rgba(0, 177, 79, 0.15)',
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px'
                                            }}>
                                            <i className="bi bi-briefcase-fill"></i>
                                        </div>
                                        <div>
                                            <span className={styles['fade-in-up']} style={{ fontSize: '17px', fontWeight: '600', color: '#333' }}>
                                                Việc làm phù hợp với bạn
                                            </span>
                                            <div className="mt-1 d-flex align-items-center flex-wrap gap-2">
                                                <span className={`text-muted ${styles['fade-in-up']}`} style={{ fontSize: '14px', animationDelay: '0.1s' }}>
                                                    Tìm thấy <span style={{ color: '#00b14f', fontWeight: '700' }}>{totalCount}</span> việc làm
                                                </span>
                                                {activeFiltersCount() > 0 && (
                                                    <span className={`badge bg-primary bg-opacity-10 text-primary rounded-pill ${styles['fade-in-up']}`} style={{ fontSize: '13px', animationDelay: '0.2s' }}>
                                                        <i className="bi bi-funnel-fill me-1"></i> {activeFiltersCount()} bộ lọc
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center" >
                                        <div className="bg-light rounded-pill d-flex align-items-center px-3 py-1 me-2 d-none d-md-flex"
                                            style={{
                                                border: '1px solid #eee',
                                                background: 'linear-gradient(to right, #f8f9fa, #f1f3f5)'
                                            }}>
                                            <span className="text-muted me-2" style={{ fontSize: '14px', fontWeight: '500' }}>Sắp xếp:</span>
                                        </div>
                                        <Select
                                            value={sortOption}
                                            onChange={handleSortChange}
                                            options={sortOptions}
                                            className="sort-select"
                                            isSearchable={false}
                                            classNamePrefix="select-filter"
                                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                            menuPosition="fixed"
                                            menuPlacement="auto"
                                            styles={{
                                                control: (provided, state) => ({
                                                    ...provided,
                                                    minWidth: '160px',
                                                    fontSize: '14px',
                                                    borderColor: state.isFocused ? '#00b14f' : '#e0e0e0',
                                                    boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(0, 177, 79, 0.25)' : 'none',
                                                    borderRadius: '10px',
                                                    height: '38px',
                                                    minHeight: '38px',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        borderColor: '#00b14f'
                                                    }
                                                }),
                                                valueContainer: (provided) => ({
                                                    ...provided,
                                                    padding: '0 8px',
                                                    height: '36px'
                                                }),
                                                indicatorsContainer: (provided) => ({
                                                    ...provided,
                                                    height: '36px'
                                                }),
                                                option: (provided, state) => ({
                                                    ...provided,
                                                    fontSize: '14px',
                                                    backgroundColor: state.isSelected ? '#00b14f' : state.isFocused ? '#e6f7ef' : 'white',
                                                    color: state.isSelected ? 'white' : '#333',
                                                    padding: '10px 12px'
                                                }),
                                                menu: (provided) => ({
                                                    ...provided,
                                                    zIndex: 9999,
                                                    borderRadius: '10px',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                                    overflow: 'hidden'
                                                }),
                                                menuPortal: (provided) => ({
                                                    ...provided,
                                                    zIndex: 9999
                                                }),
                                                indicatorSeparator: () => ({
                                                    display: 'none'
                                                }),
                                                dropdownIndicator: (provided) => ({
                                                    ...provided,
                                                    color: '#00b14f'
                                                })
                                            }}
                                        />
                                    </div>
                                </Card.Header>
                                <Card.Body className="p-3">
                                    <div className={styles.seach}>{isLoading ? (
                                        <div className={`text-center py-5 ${styles['loading-container']}`}>
                                            <div className={styles['loading-pulse']} style={{ position: 'relative' }}>
                                                <div className="spinner-grow" role="status" style={{ color: '#00b14f', width: '3rem', height: '3rem', opacity: '0.7' }}>
                                                    <span className="visually-hidden">Đang tải...</span>
                                                </div>
                                                <div className="spinner-border position-absolute top-0 start-50 translate-middle-x" role="status" style={{ color: '#0b7ed0', width: '2rem', height: '2rem', opacity: '0.6' }}>
                                                    <span className="visually-hidden">Đang tải...</span>
                                                </div>
                                            </div>
                                            <p className="mt-4 animate__animated animate__fadeIn animate__slower" style={{ color: '#333', fontWeight: '500', fontSize: '1.1rem' }}>
                                                <span style={{ color: '#00b14f' }}>AI</span> đang tìm việc làm phù hợp với bạn...
                                            </p>
                                            <div className="d-flex align-items-center justify-content-center mt-2 gap-2">
                                                <div className="progress" style={{ height: '6px', width: '200px', borderRadius: '10px', backgroundColor: '#e9ecef' }}>
                                                    <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style={{ width: '80%', backgroundColor: '#00b14f' }}></div>
                                                </div>
                                                <span className="text-muted small">80%</span>
                                            </div>
                                            <p className="text-muted small mt-2 fst-italic">Kết quả sẽ hiển thị trong vài giây...</p>
                                        </div>) : jobPosts.length > 0 ? (jobPosts.map((job) => (
                                            <Card
                                                key={job.id}
                                                className={`mb-3 ${styles['job-card']} ${job.highlightType === "TopMax" ? styles['topmax-job-card'] :
                                                    job.highlightType === "TopPro" ? styles['toppro-job-card'] :
                                                        job.employerIsPro ? 'border-start border-info border-4' : ''
                                                    }`}
                                                onClick={() => handleJobClick(job.id)}
                                                style={{
                                                    boxShadow: job.highlightType ? "0 4px 15px rgba(0,0,0,0.08)" : "0 2px 8px rgba(0,0,0,0.04)",
                                                    background: job.highlightType === "TopMax" ? "linear-gradient(to right, #fff9f9, #fff)" :
                                                        job.highlightType === "TopPro" ? "linear-gradient(to right, #f9fcff, #fff)" :
                                                            job.employerIsPro ? "linear-gradient(to right, #f9fcff, #fff)" : "#fff",
                                                    borderRadius: '14px',
                                                    border: '1px solid',
                                                    borderColor: job.highlightType === "TopMax" ? "#ffecec" :
                                                        job.highlightType === "TopPro" ? "#eef6ff" :
                                                            job.employerIsPro ? "#ecf5ff" : "#f0f0f0"
                                                }}
                                            >
                                                <Card.Body className="p-1">
                                                    <Row>
                                                        <Col md={2} className="d-flex align-items-center justify-content-center mb-3 mb-md-0">
                                                            {job.companyLogo ? (
                                                                <div className={`${styles['logo-container']} ${styles['company-logo-wrapper']} bg-white d-flex align-items-center justify-content-center`}
                                                                    style={{
                                                                        width: "90px",
                                                                        height: "90px",
                                                                        borderRadius: "12px",
                                                                        border: "1px solid #f0f0f0",
                                                                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                                                        overflow: "hidden",
                                                                        position: "relative"
                                                                    }}>
                                                                    <div className={styles['logo-shine']}></div>
                                                                    <img
                                                                        src={job.companyLogo}
                                                                        alt={job.companyName}
                                                                        className={`img-fluid ${styles['company-logo']}`}
                                                                        style={{
                                                                            maxWidth: "75px",
                                                                            maxHeight: "75px",
                                                                            objectFit: "contain",
                                                                            transition: "all 0.4s ease"
                                                                        }}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className={`${styles['logo-container']} ${styles['company-logo-wrapper']} bg-light d-flex align-items-center justify-content-center`}
                                                                    style={{
                                                                        width: "90px",
                                                                        height: "90px",
                                                                        borderRadius: "12px",
                                                                        border: "1px solid #f0f0f0",
                                                                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                                                        overflow: "hidden",
                                                                        background: "linear-gradient(45deg, #f9f9f9, #f0f0f0)"
                                                                    }}>
                                                                    <i className="bi bi-building text-primary" style={{ fontSize: "2rem", opacity: "0.7" }}></i>
                                                                </div>
                                                            )}
                                                        </Col>
                                                        <Col md={10}>
                                                            <div className="d-flex justify-content-between align-items-start flex-wrap flex-md-nowrap">
                                                                <div>
                                                                    <h5 className={`fw-bold mb-2 ${styles['job-title']}`}
                                                                        style={{
                                                                            fontSize: '1.2rem',
                                                                            lineHeight: '1.4',
                                                                            position: 'relative',
                                                                            display: 'inline-block',
                                                                            transition: 'all 0.3s ease',
                                                                            color: '#333'
                                                                        }}>
                                                                        {job.title}
                                                                        <div className={styles['job-title-underline']}></div>
                                                                    </h5>
                                                                    <div className="d-flex align-items-center mb-2">
                                                                        <span className={`${styles['company-name']}`} style={{ fontSize: '1rem', fontWeight: '500', color: '#0b7ed0' }}>
                                                                            {job.companyName}
                                                                        </span>

                                                                        {/* Hiển thị thông tin rating và follow ngay bên cạnh tên công ty */}
                                                                        {(job.averageRating > 0 || job.followerCount > 0) && (
                                                                            <div className="ms-2 d-flex align-items-center gap-2">
                                                                                {job.averageRating > 0 && (
                                                                                    <span className="badge bg-warning bg-opacity-10 text-warning px-2 py-1 rounded-pill"
                                                                                        style={{ fontSize: '12px', fontWeight: '500' }}>
                                                                                        <i className="bi bi-star-fill me-1"></i>
                                                                                        {job.averageRating.toFixed(1)}
                                                                                    </span>
                                                                                )}
                                                                                {job.followerCount > 0 && (
                                                                                    <span className="badge bg-success bg-opacity-10 text-success px-2 py-1 rounded-pill"
                                                                                        style={{ fontSize: '12px', fontWeight: '500' }}>
                                                                                        <i className="bi bi-people-fill me-1"></i>
                                                                                        {job.followerCount}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="ms-md-3 mb-2">{job.highlightType === "TopMax" && (
                                                                    <span className={`badge rounded-pill ms-2 d-flex align-items-center ${styles['topmax-badge']} animate__animated animate__fadeInRight`}
                                                                        style={{
                                                                            fontSize: "0.75rem",
                                                                            padding: "5px 12px",
                                                                            fontWeight: "600"
                                                                        }}>
                                                                        <i className="bi bi-stars me-1"></i> Top Max
                                                                    </span>
                                                                )}
                                                                    {job.highlightType === "TopPro" && (
                                                                        <span className={`badge rounded-pill ms-2 d-flex align-items-center ${styles['toppro-badge']} animate__animated animate__fadeInRight`}
                                                                            style={{
                                                                                fontSize: "0.75rem",
                                                                                padding: "5px 12px",
                                                                                fontWeight: "600"
                                                                            }}>
                                                                            <i className="bi bi-trophy-fill me-1"></i> Top Pro
                                                                        </span>
                                                                    )}
                                                                    {!job.highlightType && job.employerIsPro && (
                                                                        <span className="badge bg-info rounded-pill ms-2 d-flex align-items-center"
                                                                            style={{
                                                                                fontSize: "0.75rem",
                                                                                padding: "5px 12px",
                                                                                boxShadow: '0 2px 5px rgba(13, 202, 240, 0.3)'
                                                                            }}>
                                                                            <i className="bi bi-patch-check-fill me-1"></i> Nhà tuyển dụng Pro
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="d-flex flex-wrap gap-2">
                                                                {job.salary && (
                                                                    <div className={`${styles['job-info-tag']} ${styles['salary-tag']}`}>
                                                                        <i className="bi bi-cash-stack me-2"></i>
                                                                        <span style={{ fontWeight: '500' }}>{job.salary}</span>
                                                                    </div>
                                                                )}
                                                                {job.location && (
                                                                    <div className={`${styles['job-info-tag']} ${styles['location-tag']}`}>
                                                                        <i className="bi bi-geo-alt-fill me-2"></i>
                                                                        <span style={{ fontWeight: '500' }}>{job.location}</span>
                                                                    </div>
                                                                )}
                                                                {job.employmentType && (
                                                                    <div className={`${styles['job-info-tag']} ${styles['employment-tag']}`}>
                                                                        <i className="bi bi-briefcase-fill me-2"></i>
                                                                        <span style={{ fontWeight: '500' }}>{job.employmentType}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="d-flex flex-wrap gap-2">
                                                                {job.dueDate && (
                                                                    <div className={`${styles['job-info-tag']} ${styles['date-tag']} d-flex align-items-center`}
                                                                        data-tooltip={`Hạn nộp hồ sơ: ${new Date(job.dueDate).toLocaleDateString('vi-VN')}`}>
                                                                        <i className="bi bi-calendar-event me-2"></i>
                                                                        <span style={{ fontWeight: '500' }}>Hạn nộp: {new Date(job.dueDate).toLocaleDateString('vi-VN')}</span>
                                                                    </div>
                                                                )}

                                                                {job.experience && (
                                                                    <div className={`${styles['job-info-tag']} ${styles['experience-tag']}`}>
                                                                        <i className="bi bi-person-workspace me-2"></i>
                                                                        <span style={{ fontWeight: '500' }}>{job.experience}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className={` ${styles['job-card-footer']}`}>
                                                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                                                    <span className={`${styles['post-date-badge']} d-flex align-items-center`} style={{ fontSize: "0.85rem", fontWeight: '400', padding: '6px 12px' }}>
                                                                        <i className="bi bi-clock-history me-1"></i>
                                                                        Đăng {new Date(job.postDate || new Date()).toLocaleDateString('vi-VN')}
                                                                    </span>
                                                                    <div>                                <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        className={`me-2 rounded-pill ${styles['actions-btn']}`}
                                                                        style={{
                                                                            fontSize: "0.85rem",
                                                                            padding: "6px 14px",
                                                                            fontWeight: '500',
                                                                            borderWidth: '1.5px',
                                                                            transition: 'all 0.3s ease'
                                                                        }}
                                                                        onMouseOver={(e) => {
                                                                            e.target.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
                                                                            e.target.style.transform = 'translateY(-2px)';
                                                                            e.target.style.boxShadow = '0 4px 8px rgba(13, 110, 253, 0.2)';
                                                                        }}
                                                                        onMouseOut={(e) => {
                                                                            e.target.style.backgroundColor = 'transparent';
                                                                            e.target.style.transform = 'translateY(0)';
                                                                            e.target.style.boxShadow = 'none';
                                                                        }}
                                                                    >
                                                                        <i className="bi bi-bookmark-heart-fill me-1"></i> Lưu việc làm
                                                                    </Button>
                                                                        <Button
                                                                            variant="success"
                                                                            size="sm"
                                                                            className={`rounded-pill shadow-sm ${styles['actions-btn']}`}
                                                                            style={{
                                                                                fontSize: "0.85rem",
                                                                                padding: "6px 14px",
                                                                                backgroundColor: "#00b14f",
                                                                                borderColor: "#00b14f",
                                                                                fontWeight: '500',
                                                                                transition: 'all 0.3s ease'
                                                                            }}
                                                                            onClick={(e) => handleApplyNow(e, job.id)}
                                                                            onMouseOver={(e) => {
                                                                                e.target.style.backgroundColor = "#009f47";
                                                                                e.target.style.transform = 'translateY(-2px)';
                                                                                e.target.style.boxShadow = '0 4px 8px rgba(0, 177, 79, 0.3)';
                                                                            }}
                                                                            onMouseOut={(e) => {
                                                                                e.target.style.backgroundColor = "#00b14f";
                                                                                e.target.style.transform = 'translateY(0)';
                                                                                e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                                                                            }}
                                                                        >
                                                                            <i className="bi bi-send-fill me-1"></i> Ứng tuyển ngay
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Card.Body>
                                            </Card>
                                        ))) : (
                                        <div className="text-center py-5 my-4">
                                            <div className={`${styles['fade-in-scale']}`}>
                                                <div className={`bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3`}
                                                    style={{
                                                        width: '110px',
                                                        height: '110px',
                                                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                                                    }}>
                                                    <i className="bi bi-search text-muted" style={{ fontSize: "3.5rem", opacity: '0.6' }}></i>
                                                </div>
                                                <h4 className="mt-4 fw-bold" style={{ color: '#444' }}>Không tìm thấy việc làm phù hợp</h4>
                                                <p className="text-muted my-3" style={{ maxWidth: '500px', margin: '0 auto' }}>
                                                    Rất tiếc, chúng tôi không tìm thấy việc làm nào phù hợp với bộ lọc hiện tại. Vui lòng thử
                                                    lại với từ khóa hoặc bộ lọc khác để có nhiều kết quả hơn.
                                                </p>
                                                <div className="mt-4 d-flex gap-3 justify-content-center">
                                                    <Button variant="outline-secondary" onClick={() => window.history.back()} style={{ borderRadius: '10px', padding: '10px 20px' }}>
                                                        <i className="bi bi-arrow-left me-2"></i> Quay lại
                                                    </Button>
                                                    <Button
                                                        variant="success"
                                                        onClick={handleClearFilters}
                                                        className={`shadow ${styles['btn-shine']}`}
                                                        style={{
                                                            borderRadius: '10px',
                                                            padding: '10px 20px',
                                                            backgroundColor: '#00b14f',
                                                            borderColor: '#00b14f'
                                                        }}
                                                    >
                                                        <i className="bi bi-arrow-repeat me-2"></i> Xóa bộ lọc và thử lại
                                                    </Button>
                                                </div>

                                                <div className="mt-5 pt-3 border-top" style={{ maxWidth: '600px', margin: '0 auto' }}>
                                                    <h6 className="text-primary mb-3">Gợi ý tìm kiếm</h6>
                                                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                                                        <Badge
                                                            className="bg-light text-dark p-2 rounded-pill"
                                                            style={{
                                                                fontSize: '14px',
                                                                cursor: 'pointer',
                                                                fontWeight: '400'
                                                            }}
                                                            onClick={() => {
                                                                setKeyword('developer');
                                                                setPage(1);
                                                                handleClearFilters();
                                                            }}
                                                        >
                                                            <i className="bi bi-search me-1"></i> Developer
                                                        </Badge>
                                                        <Badge
                                                            className="bg-light text-dark p-2 rounded-pill"
                                                            style={{
                                                                fontSize: '14px',
                                                                cursor: 'pointer',
                                                                fontWeight: '400'
                                                            }}
                                                            onClick={() => {
                                                                setKeyword('marketing');
                                                                setPage(1);
                                                                handleClearFilters();
                                                            }}
                                                        >
                                                            <i className="bi bi-search me-1"></i> Marketing
                                                        </Badge>
                                                        <Badge
                                                            className="bg-light text-dark p-2 rounded-pill"
                                                            style={{
                                                                fontSize: '14px',
                                                                cursor: 'pointer',
                                                                fontWeight: '400'
                                                            }}
                                                            onClick={() => {
                                                                setSelectedLocation('Hà Nội');
                                                                setPage(1);
                                                            }}
                                                        >
                                                            <i className="bi bi-geo-alt me-1"></i> Hà Nội
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    </div>
                                    {totalCount > pageSize && (
                                        <Row className="mt-4 pt-4 border-top">
                                            <Col xs={12} md={6} className="d-flex justify-content-center justify-content-md-start align-items-center mb-3 mb-md-0">
                                                <div className="d-flex align-items-center bg-light px-3 py-2 rounded-pill border" style={{ gap: '8px' }}>
                                                    <span className="text-muted" style={{ fontSize: '14px', fontWeight: '500' }}>Hiển thị:</span>                                                <Form.Select
                                                        size="sm"
                                                        value={pageSize}
                                                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                                        className={`border-0 bg-transparent ${styles['compact-select']}`}
                                                        style={{
                                                            fontSize: '14px',
                                                            padding: '0',
                                                            fontWeight: '500',
                                                            color: '#00b14f',
                                                            width: 'auto',
                                                            minWidth: '75px',
                                                            boxShadow: 'none',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.25s ease'
                                                        }}
                                                        onFocus={(e) => {
                                                            e.target.style.color = '#009f47';
                                                            e.target.style.transform = 'scale(1.03)';
                                                        }}
                                                        onBlur={(e) => {
                                                            e.target.style.color = '#00b14f';
                                                            e.target.style.transform = 'scale(1)';
                                                        }}
                                                    >
                                                        <option value={10}>10 việc làm</option>
                                                        <option value={20}>20 việc làm</option>
                                                        <option value={50}>50 việc làm</option>
                                                    </Form.Select>
                                                    <i className="bi bi-chevron-down text-primary" style={{
                                                        fontSize: '12px',
                                                        transition: 'all 0.25s ease',
                                                        color: '#00b14f'
                                                    }}></i>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} className="d-flex justify-content-center justify-content-md-end">
                                                <Pagination className={`mb-0 shadow-sm ${styles['pagination']}`} style={{ gap: '5px', borderRadius: '30px' }}>
                                                    {renderPaginationItems()}
                                                </Pagination>
                                            </Col>
                                            <Col xs={12} className="mt-3 text-center">
                                                <span className="badge bg-light text-muted px-3 py-2 rounded-pill" style={{ fontSize: '14px' }}>
                                                    <i className="bi bi-info-circle me-2" style={{ color: '#00b14f' }}></i>
                                                    Trang <span className="text-dark fw-medium">{page}</span> / <span className="text-dark fw-medium">{Math.ceil(totalCount / pageSize)}</span> -
                                                    Hiển thị <span className="text-dark fw-medium">{(page - 1) * pageSize + 1}</span>-<span className="text-dark fw-medium">{Math.min(page * pageSize, totalCount)}</span> trên tổng số <span className="text-dark fw-medium">{totalCount}</span> việc làm
                                                </span>
                                            </Col>
                                        </Row>
                                    )}
                                </Card.Body>
                            </Card>                        {/* Thêm phần gợi ý */}
                            {jobPosts.length > 0 && (
                                <Card className={`mt-4 shadow ${styles['hover-shadow']}`} style={{ borderRadius: '16px', overflow: 'hidden' }}>
                                    <Card.Body className="p-0">
                                        <Row className="g-0">
                                            <Col md={8}>
                                                <div className="p-4">
                                                    <div className="d-flex align-items-center mb-3">
                                                        <div className={`${styles['filter-icon']} me-2`} style={{ backgroundColor: 'rgba(13, 110, 253, 0.1)', color: '#0d6efd', width: '40px', height: '40px' }}>
                                                            <i className="bi bi-lightbulb fs-5"></i>
                                                        </div>
                                                        <h5 className="mb-0" style={{ color: '#0d6efd', fontWeight: '600' }}>Mẹo tìm việc hiệu quả</h5>
                                                    </div>
                                                    <ul className="text-muted" style={{ paddingLeft: '1.2rem', fontSize: '15px' }}>
                                                        <li className="mb-3">
                                                            <strong className="text-dark">Sử dụng từ khóa cụ thể</strong>: Tìm kiếm với các từ khóa liên quan trực tiếp đến kỹ năng, chức danh hoặc ngành nghề bạn quan tâm
                                                        </li>
                                                        <li className="mb-3">
                                                            <strong className="text-dark">Kết hợp nhiều bộ lọc</strong>: Sử dụng kết hợp các bộ lọc về địa điểm, mức lương và hình thức làm việc để thu hẹp kết quả
                                                        </li>
                                                        <li>
                                                            <strong className="text-dark">Cập nhật hồ sơ thường xuyên</strong>: Hồ sơ cập nhật mới giúp tăng tỷ lệ tiếp cận từ nhà tuyển dụng và nâng cao cơ hội nhận được lời mời phỏng vấn
                                                        </li>
                                                    </ul>
                                                    <div className="mt-4">
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            className="rounded-pill"
                                                            style={{ padding: '6px 16px', fontSize: '14px' }}
                                                        >
                                                            <i className="bi bi-arrow-right me-1"></i> Xem thêm mẹo tìm việc
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md={4} className="d-none d-md-block" style={{
                                                background: 'linear-gradient(135deg, #e6f2ff, #f0f7ff)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <div className="text-center p-4">
                                                    <div className="mb-3">
                                                        <i className="bi bi-graph-up-arrow" style={{ fontSize: '4rem', color: '#0d6efd' }}></i>
                                                    </div>
                                                    <h6 className="fw-bold">Tăng tỷ lệ thành công</h6>
                                                    <p className="text-muted small mb-0">Hồ sơ hoàn thiện có tỷ lệ ứng tuyển thành công cao hơn 80%</p>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            )}
                        </Col>
                    </Row>
                </Container>
            </Container>
            <FeaturedCompanies />
            <Recommend />
            <Footer />
        </>
    );
};

export default SearchJob;
