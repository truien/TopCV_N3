import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    Container, Tabs, Tab, Table, Badge, Button, Modal, Alert, Spinner,
    Form, InputGroup, Row, Col, Card, Dropdown, ProgressBar
} from 'react-bootstrap';
import Select from 'react-select';
import { getJobPostsWithPackage, updateJobPostStatus, deleteJobPost, getJobPostForEdit, updateJobPost } from '@/api/jobApi';
import { getProSubscription } from '@/api/userApi';
import { getAllJobFields } from '@/api/jobFieldsApi';
import { getAllEmploymentTypes } from '@/api/employmentTypesApi';
import BuyPackageModal from '@/components/BuyPackageModal/BuyPackageModal';
import BuyProModal from '@/components/BuyProModal/BuyProModal';
import PackageDetailModal from '@/components/PackageDetailModal/PackageDetailModal';
import EmployerReviewsManager from '@/components/EmployerReviewsManager/EmployerReviewsManager';
import { toast } from 'react-toastify';
import styles from './JobPostManager.module.css';
import {
    FaRegEye, FaRegEyeSlash, FaSearch, FaSort, FaSortUp, FaSortDown,
    FaEdit, FaChartBar, FaUsers, FaEye, FaClock, FaCalendar, FaDollarSign,
    FaMapMarkerAlt, FaFileExcel, FaPlus, FaFilter
} from "react-icons/fa";
import { GrServices } from "react-icons/gr";
import { RiDeleteBack2Line } from "react-icons/ri";
import * as XLSX from 'xlsx';

const JobPostManager = () => {
    const [posts, setPosts] = useState([]);
    const [tab, setTab] = useState('all');
    const [selectedJob, setSelectedJob] = useState(null);
    const [packageDetail, setPackageDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [proInfo, setProInfo] = useState(null);
    const [showBuyProModal, setShowBuyProModal] = useState(false); const [showEditModal, setShowEditModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [showStatsModal, setShowStatsModal] = useState(false);

    // Edit form states
    const [jobFields, setJobFields] = useState([]);
    const [employmentTypes, setEmploymentTypes] = useState([]);
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        interest: '',
        salaryRange: '',
        location: '',
        applyDeadline: '',
        jobOpeningCount: 1
    });
    const [selectedFields, setSelectedFields] = useState([]);
    const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState([]);
    const [editLoading, setEditLoading] = useState(false);

    // Search and Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('postDate');
    const [sortDirection, setSortDirection] = useState('desc');
    const [dateFilter, setDateFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');    // Statistics
    const [statistics, setStatistics] = useState(null);

    const calculateAverageSalary = useCallback((postsData) => {
        const salaries = postsData
            .map(p => p.salaryRange)
            .filter(s => s && s !== 'Thỏa thuận' && s !== 'Cạnh tranh')
            .map(s => {
                const match = s.match(/(\d+(?:\.\d+)?)/g);
                if (match && match.length >= 2) {
                    return (parseFloat(match[0]) + parseFloat(match[1])) / 2;
                }
                return null;
            })
            .filter(s => s !== null);

        return salaries.length > 0
            ? (salaries.reduce((sum, s) => sum + s, 0) / salaries.length).toFixed(1)
            : 0;
    }, []);

    const calculateStatistics = useCallback((postsData) => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const stats = {
            total: postsData.length,
            active: postsData.filter(p => p.status === 'open').length,
            closed: postsData.filter(p => p.status === 'closed').length,
            expired: postsData.filter(p => new Date(p.applyDeadline) < now).length,
            withPackages: postsData.filter(p => p.package && p.package.length > 0).length,
            recentPosts: postsData.filter(p => new Date(p.postDate) > oneWeekAgo).length,
            monthlyPosts: postsData.filter(p => new Date(p.postDate) > oneMonthAgo).length,
            totalViews: postsData.reduce((sum, p) => sum + (p.viewCount || 0), 0),
            avgSalary: calculateAverageSalary(postsData)
        };
        setStatistics(stats);
    }, [calculateAverageSalary]);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const res = await getJobPostsWithPackage();
                setPosts(res);
                calculateStatistics(res);
            } catch {
                toast.error('Không thể tải bài viết');
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [refresh, calculateStatistics]);

    useEffect(() => {
        const fetchPro = async () => {
            try {
                const res = await getProSubscription();
                setProInfo(res);
            } catch {
                console.error('Không thể tải thông tin Pro');
            }
        };
        fetchPro();
    }, []);

    // Load job fields and employment types for edit form
    useEffect(() => {
        const loadFormData = async () => {
            try {
                const [fieldsRes, typesRes] = await Promise.all([
                    getAllJobFields(),
                    getAllEmploymentTypes()
                ]);
                setJobFields(fieldsRes);
                setEmploymentTypes(typesRes);
            } catch (error) {
                console.error('Error loading form data:', error);
            }
        };
        loadFormData();
    }, []);

    const filteredPosts = useMemo(() => {
        let filtered = posts;

        // Filter by tab
        if (tab !== 'all') {
            filtered = filtered.filter(post => post.status === tab);
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(post => post.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.salaryRange.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by date
        if (dateFilter !== 'all') {
            const now = new Date();
            const filterDate = new Date(now);

            switch (dateFilter) {
                case 'today':
                    filterDate.setDate(now.getDate());
                    break;
                case 'week':
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1);
                    break;
                default:
                    break;
            }

            if (dateFilter !== 'all') {
                filtered = filtered.filter(post => new Date(post.postDate) >= filterDate);
            }
        }

        // Sort
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortField) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'postDate':
                    aValue = new Date(a.postDate);
                    bValue = new Date(b.postDate);
                    break;
                case 'applyDeadline':
                    aValue = new Date(a.applyDeadline);
                    bValue = new Date(b.applyDeadline);
                    break;
                case 'location':
                    aValue = a.location.toLowerCase();
                    bValue = b.location.toLowerCase();
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                default:
                    aValue = a[sortField];
                    bValue = b[sortField];
            }

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [posts, tab, searchTerm, sortField, sortDirection, dateFilter, statusFilter]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return <FaSort className="ms-1" />;
        return sortDirection === 'asc'
            ? <FaSortUp className="ms-1" />
            : <FaSortDown className="ms-1" />;
    };

    const isExpired = (endDate) => {
        const now = new Date();
        const end = new Date(endDate);
        return end < now;
    };

    const handleClosePost = async (id) => {
        try {
            await updateJobPostStatus(id, 'closed');
            toast.success('Đã đóng bài viết');
            setRefresh(r => !r);
        } catch {
            toast.error('Lỗi khi đóng bài viết');
        }
    };

    const handleOpenPost = async (id) => {
        try {
            await updateJobPostStatus(id, 'open');
            toast.success('Đã mở lại bài viết');
            setRefresh(r => !r);
        } catch {
            toast.error('Lỗi khi mở bài viết');
        }
    };

    const handleDeletePost = async (id) => {
        if (!window.confirm('Bạn chắc chắn muốn xoá bài viết này?')) return;
        try {
            await deleteJobPost(id);
            toast.success('Đã xoá bài viết');
            setRefresh(r => !r);
        } catch (err) {
            toast.error(err?.response?.data || 'Không thể xoá bài viết');
        }
    }; const handleEditPost = async (post) => {
        setEditLoading(true);
        try {
            const detailData = await getJobPostForEdit(post.id);
            setEditingPost(detailData);

            // Set form data
            setEditFormData({
                title: detailData.title || '',
                description: detailData.description || '',
                requirements: detailData.requirements || '',
                interest: detailData.interest || '',
                salaryRange: detailData.salaryRange || '',
                location: detailData.location || '',
                applyDeadline: detailData.applyDeadline?.split('T')[0] || '',
                jobOpeningCount: detailData.jobOpeningCount || 1
            });

            // Set selected fields and employment types
            setSelectedFields(detailData.jobFields?.map(f => ({ value: f.id, label: f.name })) || []);
            setSelectedEmploymentTypes(detailData.employmentTypes?.map(t => ({ value: t.id, label: t.name })) || []);

            setShowEditModal(true);
        } catch (error) {
            toast.error('Không thể tải chi tiết bài viết');
            console.error(error);
        } finally {
            setEditLoading(false);
        }
    };

    const exportToExcel = () => {
        if (filteredPosts.length === 0) {
            toast.warning('Không có dữ liệu để xuất');
            return;
        }

        const exportData = filteredPosts.map(post => ({
            'ID': post.id,
            'Tiêu đề': post.title,
            'Địa điểm': post.location,
            'Mức lương': post.salaryRange,
            'Ngày đăng': new Date(post.postDate).toLocaleDateString('vi-VN'),
            'Hạn nộp': new Date(post.applyDeadline).toLocaleDateString('vi-VN'),
            'Trạng thái': post.status === 'open' ? 'Đang tuyển' : 'Đã đóng',
            'Gói dịch vụ': post.package && post.package.length > 0
                ? post.package.map(p => p.packageName).join(', ')
                : 'Chưa mua'
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Bài viết tuyển dụng');
        XLSX.writeFile(wb, `bai-viet-tuyen-dung-${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Đã xuất file Excel thành công');
    };

    const daysLeft = proInfo?.isPro
        ? Math.ceil((new Date(proInfo.endDate) - new Date()) / (1000 * 60 * 60 * 24))
        : 0;

    const handleSaveChanges = async () => {
        setEditLoading(true);
        try {
            const updateData = {
                ...editFormData,
                jobFieldIds: selectedFields.map(f => f.value),
                employmentTypeIds: selectedEmploymentTypes.map(t => t.value)
            };

            await updateJobPost(editingPost.id, updateData);
            toast.success('Cập nhật bài viết thành công!');
            setShowEditModal(false);
            setRefresh(r => !r); // Refresh the list
        } catch (error) {
            toast.error(error?.response?.data || 'Không thể cập nhật bài viết');
            console.error(error);
        } finally {
            setEditLoading(false);
        }
    };

    const handleFormChange = (field, value) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Container className="mt-4">
            <h3 className={styles.title}>Quản lý bài viết tuyển dụng</h3>

            {/* Banner trạng thái Pro */}
            {proInfo && (
                proInfo.isPro ? (
                    <Alert variant="success" className="d-flex justify-content-between align-items-center">
                        <div>Bạn đang sử dụng tài khoản Pro. Còn {daysLeft} ngày và {proInfo.postsLeft} lượt đăng bài miễn phí.</div>
                        <Button variant="outline-light" size="sm" onClick={() => setShowBuyProModal(true)}>
                            Gia hạn Pro
                        </Button>
                    </Alert>
                ) : (
                    <Alert variant="warning" className="d-flex justify-content-between align-items-center">
                        <div>Bạn chưa có tài khoản Pro. Hãy nâng cấp để đăng bài miễn phí và ưu tiên hiển thị!</div>
                        <Button variant="success" size="sm" onClick={() => setShowBuyProModal(true)}>
                            Mua Pro ngay
                        </Button>
                    </Alert>
                ))}

            {/* Search and Filter Controls */}
            <Row className="mb-3">
                <Col md={6}>
                    <InputGroup>
                        <InputGroup.Text>
                            <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Tìm kiếm theo tiêu đề, địa điểm, mức lương..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col md={2}>
                    <Form.Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="open">Đang tuyển</option>
                        <option value="closed">Đã đóng</option>
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    >
                        <option value="all">Tất cả thời gian</option>
                        <option value="today">Hôm nay</option>
                        <option value="week">7 ngày qua</option>
                        <option value="month">30 ngày qua</option>
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Dropdown>
                        <Dropdown.Toggle variant="outline-primary" className="w-100">
                            <FaFilter className="me-1" /> Thao tác
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => setShowStatsModal(true)}>
                                <FaChartBar className="me-2" />
                                Xem thống kê
                            </Dropdown.Item>
                            <Dropdown.Item onClick={exportToExcel}>
                                <FaFileExcel className="me-2" />
                                Xuất Excel
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
            </Row>

            {/* Statistics Summary Cards */}
            {statistics && (
                <Row className="mb-3">
                    <Col md={3}>
                        <Card className="text-center h-100">
                            <Card.Body>
                                <FaUsers className="text-primary mb-2" size={24} />
                                <h5 className="mb-1">{statistics.total}</h5>
                                <small className="text-muted">Tổng bài viết</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="text-center h-100">
                            <Card.Body>
                                <FaEye className="text-success mb-2" size={24} />
                                <h5 className="mb-1">{statistics.active}</h5>
                                <small className="text-muted">Đang hoạt động</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="text-center h-100">
                            <Card.Body>
                                <FaClock className="text-warning mb-2" size={24} />
                                <h5 className="mb-1">{statistics.recentPosts}</h5>
                                <small className="text-muted">Đăng tuần này</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="text-center h-100">
                            <Card.Body>
                                <FaDollarSign className="text-info mb-2" size={24} />
                                <h5 className="mb-1">{statistics.avgSalary} tr</h5>
                                <small className="text-muted">Lương TB</small>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}            <Tabs activeKey={tab} onSelect={setTab} className="mb-3" fill>
                <Tab eventKey="all" title={`Tất cả (${posts.length})`} />
                <Tab eventKey="open" title={`Đang hoạt động (${posts.filter(p => p.status === 'open').length})`} />
                <Tab eventKey="closed" title={`Đã đóng (${posts.filter(p => p.status === 'closed').length})`} />
                <Tab eventKey="reviews" title="Quản lý đánh giá" />
            </Tabs>            {tab === 'reviews' ? (
                <EmployerReviewsManager />
            ) : loading ? (
                <div className="text-center"><Spinner animation="border" /></div>
            ) : filteredPosts.length === 0 ? (
                <Alert variant="success">Không có bài viết nào</Alert>
            ) : (<Table striped bordered hover responsive className={`${styles.table} align-middle`}>
                <thead>
                    <tr>
                        <th className={`${styles.table_th}`} style={{ cursor: 'pointer' }} onClick={() => handleSort('title')}>
                            Tiêu đề {getSortIcon('title')}
                        </th>
                        <th className={`${styles.table_th}`} style={{ cursor: 'pointer' }} onClick={() => handleSort('location')}>
                            Địa điểm {getSortIcon('location')}
                        </th>
                        <th className={`${styles.table_th}`}>Lương</th>
                        <th className={`${styles.table_th}`} style={{ cursor: 'pointer' }} onClick={() => handleSort('postDate')}>
                            Ngày đăng {getSortIcon('postDate')}
                        </th>
                        <th className={`${styles.table_th}`} style={{ cursor: 'pointer' }} onClick={() => handleSort('applyDeadline')}>
                            Hạn nộp {getSortIcon('applyDeadline')}
                        </th>
                        <th className={`${styles.table_th}`} style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>
                            Trạng thái {getSortIcon('status')}
                        </th>
                        <th className={`${styles.table_th}`}>Gói dịch vụ</th>
                        <th className={`${styles.table_th}`}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPosts.map(post => (
                        <tr key={post.id}>
                            <td className={`${styles.table_td}`}>
                                <div>
                                    <strong>{post.title}</strong>
                                    {isExpired(post.applyDeadline) && (
                                        <Badge bg="warning" className="ms-2" style={{ fontSize: '10px' }}>
                                            Hết hạn
                                        </Badge>
                                    )}
                                </div>
                            </td>
                            <td className={`${styles.table_td}`}>
                                <FaMapMarkerAlt className="text-muted me-1" />
                                {post.location}
                            </td>
                            <td className={`${styles.table_td}`}>
                                <FaDollarSign className="text-success me-1" />
                                {post.salaryRange}
                            </td>
                            <td className={`${styles.table_td}`}>
                                <FaCalendar className="text-muted me-1" />
                                {new Date(post.postDate).toLocaleDateString('vi-VN')}
                            </td>
                            <td className={`${styles.table_td}`}>
                                <FaClock className={`me-1 ${isExpired(post.applyDeadline) ? 'text-danger' : 'text-muted'}`} />
                                {new Date(post.applyDeadline).toLocaleDateString('vi-VN')}
                            </td>
                            <td className={`${styles.table_td}`}>
                                <Badge bg={post.status === 'open' ? 'success' : 'danger'} className={styles.badge}>
                                    {post.status === 'open' ? 'Đang tuyển' : 'Đã đóng'}
                                </Badge>
                            </td>
                            <td className={`${styles.table_td}`}>
                                {post.package && post.package.length > 0 ? (
                                    <div className={styles.packageGroup}>
                                        {post.package.map((pkg, idx) => (
                                            <Button
                                                key={idx}
                                                size="sm"
                                                variant={isExpired(pkg.endDate) ? 'outline-danger' : 'outline-success'}
                                                className={styles.btnview}
                                                onClick={() =>
                                                    isExpired(pkg.endDate)
                                                        ? setSelectedJob(post)
                                                        : setPackageDetail(pkg)
                                                }
                                            >
                                                {pkg.packageName} - {isExpired(pkg.endDate) ? 'Gia hạn' : 'Xem gói'}
                                            </Button>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-muted fst-italic">Chưa mua</span>
                                )}
                            </td>
                            <td className={`${styles.table_td}`}>
                                <div className={styles.actionGroup}>
                                    <Button
                                        size="sm"
                                        variant="outline-primary"
                                        title="Chỉnh sửa"
                                        onClick={() => handleEditPost(post)}
                                    >
                                        <FaEdit />
                                    </Button>

                                    {post.status === 'open' ? (
                                        <Button
                                            size="sm"
                                            className={styles.secondaryButton}
                                            title="Đóng bài viết"
                                            onClick={() => handleClosePost(post.id)}
                                        >
                                            <FaRegEyeSlash />
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            className={styles.secondaryButton}
                                            title="Mở bài viết"
                                            onClick={() => handleOpenPost(post.id)}
                                        >
                                            <FaRegEye />
                                        </Button>
                                    )}

                                    <Button
                                        size="sm"
                                        className={styles.topButton}
                                        title="Mua gói dịch vụ"
                                        onClick={() => setSelectedJob(post)}
                                    >
                                        <GrServices />
                                    </Button>

                                    <Button
                                        size="sm"
                                        className={styles.deleteButton}
                                        title="Xóa bài viết"
                                        onClick={() => handleDeletePost(post.id)}
                                    >
                                        <RiDeleteBack2Line />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            )}

            <Modal show={!!selectedJob} onHide={() => setSelectedJob(null)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Đẩy Top / Gia hạn bài viết</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedJob && (
                        <BuyPackageModal
                            jobPostId={selectedJob.id}
                            onClose={() => {
                                setSelectedJob(null);
                                setRefresh(r => !r);
                            }}
                        />
                    )}
                </Modal.Body>
            </Modal>            <PackageDetailModal
                show={!!packageDetail}
                onClose={() => setPackageDetail(null)}
                packageInfo={packageDetail}
            />

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FaEdit className="me-2" />
                        Chỉnh sửa bài viết
                    </Modal.Title>
                </Modal.Header>                <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {editLoading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" />
                            <p className="mt-2">Đang tải thông tin...</p>
                        </div>
                    ) : editingPost && (
                        <Form>
                            <Row>
                                <Col md={12} className="mb-3">
                                    <Form.Label>Tiêu đề công việc</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editFormData.title}
                                        onChange={(e) => handleFormChange('title', e.target.value)}
                                        placeholder="Nhập tiêu đề công việc"
                                    />
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6} className="mb-3">
                                    <Form.Label>Địa điểm</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editFormData.location}
                                        onChange={(e) => handleFormChange('location', e.target.value)}
                                        placeholder="Nhập địa điểm làm việc"
                                    />
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Label>Mức lương</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editFormData.salaryRange}
                                        onChange={(e) => handleFormChange('salaryRange', e.target.value)}
                                        placeholder="Nhập mức lương"
                                    />
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6} className="mb-3">
                                    <Form.Label>Hạn nộp hồ sơ</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={editFormData.applyDeadline}
                                        onChange={(e) => handleFormChange('applyDeadline', e.target.value)}
                                    />
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Label>Số lượng tuyển</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        value={editFormData.jobOpeningCount}
                                        onChange={(e) => handleFormChange('jobOpeningCount', parseInt(e.target.value))}
                                    />
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6} className="mb-3">
                                    <Form.Label>Ngành nghề</Form.Label>
                                    <Select
                                        isMulti
                                        options={jobFields.map(f => ({ value: f.id, label: f.name }))}
                                        value={selectedFields}
                                        onChange={setSelectedFields}
                                        placeholder="Chọn ngành nghề..."
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Label>Hình thức làm việc</Form.Label>
                                    <Select
                                        isMulti
                                        options={employmentTypes.map(t => ({ value: t.id, label: t.name }))}
                                        value={selectedEmploymentTypes}
                                        onChange={setSelectedEmploymentTypes}
                                        placeholder="Chọn hình thức..."
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Mô tả công việc</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={editFormData.description}
                                    onChange={(e) => handleFormChange('description', e.target.value)}
                                    placeholder="Nhập mô tả chi tiết về công việc"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Yêu cầu ứng viên</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={editFormData.requirements}
                                    onChange={(e) => handleFormChange('requirements', e.target.value)}
                                    placeholder="Nhập yêu cầu đối với ứng viên"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Quyền lợi</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={editFormData.interest}
                                    onChange={(e) => handleFormChange('interest', e.target.value)}
                                    placeholder="Nhập quyền lợi dành cho ứng viên"
                                />
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleSaveChanges}>
                        {editLoading ? <Spinner size="sm" animation="border" /> : 'Lưu thay đổi'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Statistics Modal */}
            <Modal show={showStatsModal} onHide={() => setShowStatsModal(false)} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FaChartBar className="me-2" />
                        Thống kê bài viết tuyển dụng
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {statistics && (
                        <div>
                            {/* Statistics Overview */}
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Card className="text-center h-100 border-primary">
                                        <Card.Body>
                                            <FaUsers className="text-primary mb-2" size={32} />
                                            <h3 className="text-primary">{statistics.total}</h3>
                                            <p className="mb-0">Tổng bài viết</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={3}>
                                    <Card className="text-center h-100 border-success">
                                        <Card.Body>
                                            <FaEye className="text-success mb-2" size={32} />
                                            <h3 className="text-success">{statistics.active}</h3>
                                            <p className="mb-0">Đang hoạt động</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={3}>
                                    <Card className="text-center h-100 border-danger">
                                        <Card.Body>
                                            <FaRegEyeSlash className="text-danger mb-2" size={32} />
                                            <h3 className="text-danger">{statistics.closed}</h3>
                                            <p className="mb-0">Đã đóng</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={3}>
                                    <Card className="text-center h-100 border-warning">
                                        <Card.Body>
                                            <FaClock className="text-warning mb-2" size={32} />
                                            <h3 className="text-warning">{statistics.expired}</h3>
                                            <p className="mb-0">Đã hết hạn</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            {/* Additional Statistics */}
                            <Row className="mb-4">
                                <Col md={4}>
                                    <Card className="text-center h-100">
                                        <Card.Body>
                                            <GrServices className="text-info mb-2" size={28} />
                                            <h4 className="text-info">{statistics.withPackages}</h4>
                                            <p className="mb-0">Có gói dịch vụ</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className="text-center h-100">
                                        <Card.Body>
                                            <FaCalendar className="text-purple mb-2" size={28} />
                                            <h4 className="text-purple">{statistics.recentPosts}</h4>
                                            <p className="mb-0">Đăng tuần này</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className="text-center h-100">
                                        <Card.Body>
                                            <FaDollarSign className="text-success mb-2" size={28} />
                                            <h4 className="text-success">{statistics.avgSalary} triệu</h4>
                                            <p className="mb-0">Lương trung bình</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            {/* Progress Bars */}
                            <Row>
                                <Col md={6}>
                                    <Card>
                                        <Card.Header>
                                            <h6 className="mb-0">Tỷ lệ bài viết đang hoạt động</h6>
                                        </Card.Header>
                                        <Card.Body>
                                            <ProgressBar
                                                now={(statistics.active / statistics.total) * 100}
                                                label={`${Math.round((statistics.active / statistics.total) * 100)}%`}
                                                variant="success"
                                            />
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <Card>
                                        <Card.Header>
                                            <h6 className="mb-0">Tỷ lệ có gói dịch vụ</h6>
                                        </Card.Header>
                                        <Card.Body>
                                            <ProgressBar
                                                now={(statistics.withPackages / statistics.total) * 100}
                                                label={`${Math.round((statistics.withPackages / statistics.total) * 100)}%`}
                                                variant="info"
                                            />
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <hr className="my-4" />

                            {/* Additional Info */}
                            <Row>
                                <Col md={12}>
                                    <Alert variant="info">
                                        <h6>Tổng quan:</h6>
                                        <ul className="mb-0">
                                            <li>Tổng lượt xem: <strong>{statistics.totalViews.toLocaleString('vi-VN')}</strong></li>
                                            <li>Bài viết mới trong tháng: <strong>{statistics.monthlyPosts}</strong></li>
                                            <li>Tỷ lệ thành công: <strong>{Math.round((statistics.active / statistics.total) * 100)}%</strong></li>
                                        </ul>
                                    </Alert>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-primary" onClick={exportToExcel}>
                        <FaFileExcel className="me-2" />
                        Xuất báo cáo Excel
                    </Button>
                    <Button variant="secondary" onClick={() => setShowStatsModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

            <BuyProModal onClose={() => setShowBuyProModal(false)} show={showBuyProModal} />
        </Container>
    );
};

export default JobPostManager;
