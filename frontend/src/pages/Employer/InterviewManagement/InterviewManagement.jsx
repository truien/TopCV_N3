// ✅ InterviewManagement.jsx (Enhanced with full functionality)
import { useEffect, useState, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import styles from './InterviewManagement.module.css';
import { getAllInterviews, getActiveJobs, updateInterviewStatus, rescheduleInterview } from '@/api/interviewApi';
import {
    Container, Row, Col, Card, Table, Badge, Button, Modal, Alert, Spinner,
    Form, InputGroup, Dropdown, ButtonGroup, ProgressBar, Tabs, Tab,
    OverlayTrigger, Tooltip
} from 'react-bootstrap';
import {
    FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown, FaEye, FaEdit,
    FaTrash, FaCheck, FaTimes, FaCalendarAlt, FaEnvelope, FaUser,
    FaBuilding, FaClock, FaFileAlt, FaDownload, FaChartBar, FaUsers,
    FaClipboardCheck, FaExclamationTriangle, FaFileExcel, FaPrint,
    FaUserGraduate, FaPhone, FaMapMarkerAlt, FaStar, FaRegClock,
    FaVideo, FaHistory, FaPlus, FaSync, FaBell
} from 'react-icons/fa';

const InterviewManagement = () => {
    const [interviews, setInterviews] = useState([]);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Filter and Search states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterJob, setFilterJob] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [sortField, setSortField] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentTab, setCurrentTab] = useState('all');

    // Data states
    const [jobs, setJobs] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [selectedInterviews, setSelectedInterviews] = useState([]);

    // Form states
    const [newStatus, setNewStatus] = useState('');
    const [statusNote, setStatusNote] = useState('');
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleTime, setRescheduleTime] = useState('');
    const [rescheduleNote, setRescheduleNote] = useState('');

    const calculateStatistics = useCallback((interviewsData) => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const stats = {
            total: interviewsData.length,
            pending: interviewsData.filter(i => i.status === 'pending').length,
            accepted: interviewsData.filter(i => i.status === 'accepted').length,
            declined: interviewsData.filter(i => i.status === 'declined').length,
            completed: interviewsData.filter(i => i.status === 'completed').length,
            recentInterviews: interviewsData.filter(i => new Date(i.createdAt) > oneWeekAgo).length,
            monthlyInterviews: interviewsData.filter(i => new Date(i.createdAt) > oneMonthAgo).length,
            upcomingToday: interviewsData.filter(i => {
                const interviewDate = new Date(i.scheduledDate);
                const today = new Date();
                return interviewDate.toDateString() === today.toDateString() && i.status === 'accepted';
            }).length,
            topJobs: getTopJobs(interviewsData)
        };
        setStatistics(stats);
    }, []);

    const getTopJobs = (interviewsData) => {
        const jobCounts = {};
        interviewsData.forEach(interview => {
            jobCounts[interview.jobTitle] = (jobCounts[interview.jobTitle] || 0) + 1;
        });
        return Object.entries(jobCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([job, count]) => ({ job, count }));
    };

    const fetchInterviews = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllInterviews();
            setInterviews(data);
            calculateStatistics(data);
        } catch (err) {
            toast.error('Không thể tải danh sách phỏng vấn.');
            console.error('Lỗi khi tải:', err);
        } finally {
            setLoading(false);
        }
    }, [calculateStatistics]);

    const fetchJobs = useCallback(async () => {
        try {
            const data = await getActiveJobs();
            setJobs(data);
        } catch (err) {
            console.error('Lỗi khi tải jobs:', err);
        }
    }, []);

    useEffect(() => {
        fetchInterviews();
        fetchJobs();
    }, [fetchInterviews, fetchJobs]);

    const filteredInterviews = useMemo(() => {
        let filtered = interviews;

        // Filter by tab
        if (currentTab !== 'all') {
            filtered = filtered.filter(interview => interview.status === currentTab);
        }

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(interview => interview.status === filterStatus);
        }

        // Filter by job
        if (filterJob !== 'all') {
            filtered = filtered.filter(interview => interview.jobTitle === filterJob);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(interview =>
                interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                interview.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                interview.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
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
                filtered = filtered.filter(interview => new Date(interview.createdAt) >= filterDate);
            }
        }

        // Sort
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortField) {
                case 'candidateName':
                    aValue = a.candidateName.toLowerCase();
                    bValue = b.candidateName.toLowerCase();
                    break;
                case 'createdAt':
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
                    break;
                case 'jobTitle':
                    aValue = a.jobTitle.toLowerCase();
                    bValue = b.jobTitle.toLowerCase();
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
    }, [interviews, currentTab, filterStatus, filterJob, searchTerm, dateFilter, sortField, sortDirection]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Helper functions
    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { variant: 'warning', icon: FaClock, label: 'Chờ xác nhận' },
            accepted: { variant: 'success', icon: FaCheck, label: 'Đã xác nhận' },
            declined: { variant: 'danger', icon: FaTimes, label: 'Từ chối' },
        };

        const config = statusConfig[status] || { variant: 'light', icon: FaExclamationTriangle, label: 'Không xác định' };
        const IconComponent = config.icon;

        return (
            <Badge bg={config.variant} className={styles.statusBadge}>
                <IconComponent className="me-1" />
                {config.label}
            </Badge>
        );
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return <FaSort className="ms-1" />;
        return sortDirection === 'asc' ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />;
    };

    const handleUpdateStatus = async () => {
        try {
            const ids = selectedInterviews.length > 0
                ? selectedInterviews
                : [selectedInterview.id];

            await Promise.all(ids.map(id =>
                updateInterviewStatus(id, newStatus, statusNote)
            ));

            toast.success(`Đã cập nhật trạng thái cho ${ids.length} cuộc phỏng vấn.`);
            setShowStatusModal(false);
            setSelectedInterviews([]);
            fetchInterviews();
        } catch (err) {
            toast.error("Lỗi khi cập nhật trạng thái.");
            console.error(err);
        }
    };

    const handleReschedule = async () => {
        try {
            const scheduledDateTime = new Date(`${rescheduleDate}T${rescheduleTime}`);

            await rescheduleInterview(
                selectedInterview.id,
                scheduledDateTime.toISOString().split('T')[0], // date part
                rescheduleTime, // time part
                rescheduleNote
            );

            toast.success('Đã dời lịch phỏng vấn thành công.');
            setShowRescheduleModal(false);
            fetchInterviews();
        } catch (err) {
            toast.error("Lỗi khi dời lịch phỏng vấn.");
            console.error(err);
        }
    };

    const handleExportExcel = () => {
        if (filteredInterviews.length === 0) {
            toast.warning('Không có dữ liệu để xuất');
            return;
        }

        const exportData = filteredInterviews.map(i => ({
            'Ứng viên': i.candidateName,
            'Email': i.email,
            'Công việc': i.jobTitle,
            'Trạng thái': i.status,
            'Ngày tạo': new Date(i.createdAt).toLocaleString('vi-VN'),
            'Ngày phỏng vấn': i.scheduledDate ? new Date(i.scheduledDate).toLocaleString('vi-VN') : 'Chưa xác định',
            'Ghi chú': i.note || '-'
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Phỏng vấn');
        XLSX.writeFile(wb, `lich-phong-van-${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Đã xuất file Excel thành công');
    };

    return (
        <div className={styles.wrapper}>
            <Container>
                {/* Enhanced Header Section */}
                <div className={styles.heroSection}>
                    <Row className="align-items-center">
                        <Col lg={8}>
                            <div className={styles.header}>
                                <h1 className={styles.h3_title}>
                                    <div className={styles.iconWrapper}>
                                        <FaCalendarAlt />
                                    </div>
                                    Quản lý lịch phỏng vấn
                                </h1>
                                <p className={styles.subtitle}>
                                    Theo dõi và quản lý tất cả các cuộc phỏng vấn một cách hiệu quả với giao diện hiện đại
                                </p>
                            </div>
                        </Col>
                        <Col lg={4}>
                            <div className={styles.quickActions}>
                                <Button
                                    variant="outline-primary"
                                    size="lg"
                                    className={styles.quickActionBtn}
                                    onClick={() => setShowStatsModal(true)}
                                >
                                    <FaChartBar className="me-2" />
                                    Xem thống kê
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* Enhanced Statistics Section */}
                {statistics && (
                    <Row className={styles.statsContainer}>
                        <Col xl={3} md={6} className="mb-4">
                            <Card className={`${styles.statCard} ${styles.statCardTotal}`}>
                                <Card.Body>
                                    <div className={styles.statCardHeader}>
                                        <div className={styles.statIcon}>
                                            <FaUsers />
                                        </div>
                                        <div className={styles.statNumber}>
                                            {statistics.total}
                                        </div>
                                    </div>
                                    <div className={styles.statLabel}>Tổng phỏng vấn</div>
                                    <div className={styles.statTrend}>
                                        <FaStar className="me-1" />
                                        Tất cả thời gian
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xl={3} md={6} className="mb-4">
                            <Card className={`${styles.statCard} ${styles.statCardPending}`}>
                                <Card.Body>
                                    <div className={styles.statCardHeader}>
                                        <div className={styles.statIcon}>
                                            <FaClock />
                                        </div>
                                        <div className={styles.statNumber}>
                                            {statistics.pending}
                                        </div>
                                    </div>
                                    <div className={styles.statLabel}>Chờ xác nhận</div>
                                    <div className={styles.statTrend}>
                                        <FaRegClock className="me-1" />
                                        Cần xử lý
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xl={3} md={6} className="mb-4">
                            <Card className={`${styles.statCard} ${styles.statCardToday}`}>
                                <Card.Body>
                                    <div className={styles.statCardHeader}>
                                        <div className={styles.statIcon}>
                                            <FaCalendarAlt />
                                        </div>
                                        <div className={styles.statNumber}>
                                            {statistics.upcomingToday}
                                        </div>
                                    </div>
                                    <div className={styles.statLabel}>Hôm nay</div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xl={3} md={6} className="mb-4">
                            <Card className={`${styles.statCard} ${styles.statCardCompleted}`}>
                                <Card.Body>
                                    <div className={styles.statCardHeader}>
                                        <div className={styles.statIcon}>
                                            <FaClipboardCheck />
                                        </div>
                                        <div className={styles.statNumber}>
                                            {statistics.completed}
                                        </div>
                                    </div>
                                    <div className={styles.statTrend}>
                                        <FaCheck className="me-1" />
                                        Thành công
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* Enhanced Search and Filter Controls */}
                <Card className={`${styles.controlsSection}`}>
                    <Card.Body className={styles.controlsBody}>
                        <div className={styles.controlsHeader}>
                            <h5 className={styles.controlsTitle}>
                                <FaFilter className="me-2" />
                                Bộ lọc & Tìm kiếm
                            </h5>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterStatus('all');
                                    setFilterJob('all');
                                    setDateFilter('all');
                                }}
                                className={styles.resetButton}
                            >
                                <FaSync className="me-1" />
                                Đặt lại
                            </Button>
                        </div>

                        <Row className="g-3 mb-4">
                            <Col lg={4} md={6}>
                                <div className={styles.inputGroup}>
                                    <Form.Label className={styles.inputLabel}>
                                        <FaSearch className="me-1" />
                                        Tìm kiếm
                                    </Form.Label>
                                    <div className={styles.searchWrapper}>
                                        <FaSearch className={styles.searchIcon} />
                                        <Form.Control
                                            type="text"
                                            placeholder="Tìm theo tên, email, vị trí..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className={styles.searchInput}
                                        />
                                        {searchTerm && (
                                            <button
                                                className={styles.clearButton}
                                                onClick={() => setSearchTerm('')}
                                            >
                                                <FaTimes />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Col>

                            <Col lg={2} md={6}>
                                <div className={styles.inputGroup}>
                                    <Form.Label className={styles.inputLabel}>
                                        <FaClipboardCheck className="me-1" />
                                        Trạng thái
                                    </Form.Label>
                                    <Form.Select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className={styles.selectInput}
                                    >
                                        <option value="all">Tất cả trạng thái</option>
                                        <option value="pending">🕐 Chờ xác nhận</option>
                                        <option value="accepted">✅ Đã xác nhận</option>
                                        <option value="declined">❌ Từ chối</option>
                                    </Form.Select>
                                </div>
                            </Col>

                            <Col lg={3} md={6}>
                                <div className={styles.inputGroup}>
                                    <Form.Label className={styles.inputLabel}>
                                        <FaBuilding className="me-1" />
                                        Vị trí công việc
                                    </Form.Label>
                                    <Form.Select
                                        value={filterJob}
                                        onChange={(e) => setFilterJob(e.target.value)}
                                        className={styles.selectInput}
                                    >
                                        <option value="all">Tất cả vị trí</option>
                                        {jobs.map(j => (
                                            <option key={j.id} value={j.title}>💼 {j.title}</option>
                                        ))}
                                    </Form.Select>
                                </div>
                            </Col>

                            <Col lg={3} md={6}>
                                <div className={styles.inputGroup}>
                                    <Form.Label className={styles.inputLabel}>
                                        <FaCalendarAlt className="me-1" />
                                        Khoảng thời gian
                                    </Form.Label>
                                    <Form.Select
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                        className={styles.selectInput}
                                    >
                                        <option value="all">Tất cả thời gian</option>
                                        <option value="today">📅 Hôm nay</option>
                                        <option value="week">📆 7 ngày qua</option>
                                        <option value="month">🗓️ 30 ngày qua</option>
                                    </Form.Select>
                                </div>
                            </Col>
                        </Row>

                        <div className={styles.actionButtonsContainer}>
                            <div className={styles.leftActions}>
                                <span className={styles.resultCount}>
                                    Hiển thị <strong>{filteredInterviews.length}</strong> trong tổng số <strong>{interviews.length}</strong> phỏng vấn
                                </span>
                            </div>

                            <div className={styles.rightActions}>
                                <Button
                                    variant="outline-primary"
                                    onClick={() => setShowStatsModal(true)}
                                    className={styles.actionButton}
                                >
                                    <FaChartBar className="me-2" />
                                    Thống kê chi tiết
                                </Button>

                                <Button
                                    variant="outline-success"
                                    onClick={handleExportExcel}
                                    className={styles.actionButton}
                                    disabled={filteredInterviews.length === 0}
                                >
                                    <FaFileExcel className="me-2" />
                                    Xuất Excel
                                </Button>

                                {selectedInterviews.length > 0 && (
                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                            setSelectedInterview(null);
                                            setNewStatus('');
                                            setStatusNote('');
                                            setShowStatusModal(true);
                                        }}
                                        className={styles.bulkActionButton}
                                    >
                                        <FaEdit className="me-2" />
                                        Cập nhật hàng loạt ({selectedInterviews.length})
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* Enhanced Tabs */}
                <div className={styles.tabsContainer}>
                    <Tabs
                        activeKey={currentTab}
                        onSelect={setCurrentTab}
                        className={styles.customTabs}
                    >
                        <Tab
                            eventKey="all"
                            title={
                                <div className={styles.tabTitle}>
                                    <FaUsers className="me-2" />
                                    <span>Tất cả</span>
                                    <Badge bg="secondary" className={styles.tabBadge}>{interviews.length}</Badge>
                                </div>
                            }
                        />
                        <Tab
                            eventKey="pending"
                            title={
                                <div className={styles.tabTitle}>
                                    <FaClock className="me-2" />
                                    <span>Chờ xác nhận</span>
                                    <Badge bg="warning" className={styles.tabBadge}>{statistics?.pending || 0}</Badge>
                                </div>
                            }
                        />
                        <Tab
                            eventKey="accepted"
                            title={
                                <div className={styles.tabTitle}>
                                    <FaCheck className="me-2" />
                                    <span>Đã xác nhận</span>
                                    <Badge bg="success" className={styles.tabBadge}>{statistics?.accepted || 0}</Badge>
                                </div>
                            }
                        />
                        <Tab
                            eventKey="declined"
                            title={
                                <div className={styles.tabTitle}>
                                    <FaTimes className="me-2" />
                                    <span>Từ chối</span>
                                    <Badge bg="danger" className={styles.tabBadge}>{statistics?.declined || 0}</Badge>
                                </div>
                            }
                        />
                    </Tabs>
                </div>

                {/* Enhanced Loading State */}
                {loading ? (
                    <Card className={styles.loadingCard}>
                        <Card.Body className={styles.loadingContent}>
                            <div className={styles.loadingSpinner}>
                                <div className={styles.spinner}></div>
                                <div className={styles.spinnerRings}>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                </div>
                            </div>
                            <h4 className={styles.loadingTitle}>Đang tải dữ liệu...</h4>
                            <p className={styles.loadingSubtitle}>Vui lòng chờ trong giây lát</p>
                        </Card.Body>
                    </Card>
                ) : filteredInterviews.length === 0 ? (
                    <Card className={styles.emptyStateCard}>
                        <Card.Body className={styles.emptyStateContent}>
                            <div className={styles.emptyStateIcon}>
                                <FaExclamationTriangle />
                            </div>
                            <h4 className={styles.emptyStateTitle}>Không tìm thấy cuộc phỏng vấn nào</h4>
                            <p className={styles.emptyStateSubtitle}>
                                {searchTerm || filterStatus !== 'all' || filterJob !== 'all' || dateFilter !== 'all'
                                    ? 'Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm'
                                    : 'Hiện tại chưa có cuộc phỏng vấn nào được tạo'
                                }
                            </p>
                            <div className={styles.emptyStateActions}>
                                {(searchTerm || filterStatus !== 'all' || filterJob !== 'all' || dateFilter !== 'all') && (
                                    <Button
                                        variant="outline-primary"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setFilterStatus('all');
                                            setFilterJob('all');
                                            setDateFilter('all');
                                        }}
                                        className={styles.clearFiltersButton}
                                    >
                                        <FaSync className="me-2" />
                                        Xóa bộ lọc
                                    </Button>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                ) : (
                    <Card className={styles.tableCard}>
                        <Card.Header className={styles.tableHeader}>
                            <div className={styles.tableHeaderContent}>
                                <h5 className={styles.tableTitle}>
                                    <FaClipboardCheck className="me-2" />
                                    Danh sách phỏng vấn
                                </h5>
                                <div className={styles.tableHeaderActions}>
                                    <Form.Check
                                        type="checkbox"
                                        label="Chọn tất cả"
                                        className={styles.selectAllCheckbox}
                                        onChange={e => setSelectedInterviews(
                                            e.target.checked
                                                ? filteredInterviews.map(i => i.id)
                                                : []
                                        )}
                                        checked={
                                            filteredInterviews.length > 0 &&
                                            selectedInterviews.length === filteredInterviews.length
                                        }
                                    />
                                </div>
                            </div>
                        </Card.Header>
                        <div className={styles.tableContainer}>
                            <Table responsive hover className={styles.modernTable}>
                                <thead>
                                    <tr>
                                        <th className={styles.table_th}>
                                            <Form.Check
                                                type="checkbox"
                                                onChange={e => setSelectedInterviews(
                                                    e.target.checked
                                                        ? filteredInterviews.map(i => i.id)
                                                        : []
                                                )}
                                                checked={
                                                    filteredInterviews.length > 0 &&
                                                    selectedInterviews.length === filteredInterviews.length
                                                }
                                            />
                                        </th>
                                        <th
                                            className={styles.table_th}
                                            onClick={() => handleSort('candidateName')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <FaUser className="me-1" />
                                            Ứng viên
                                            <span className={styles.sortIcon}>{getSortIcon('candidateName')}</span>
                                        </th>
                                        <th
                                            className={styles.table_th}
                                            onClick={() => handleSort('jobTitle')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <FaBuilding className="me-1" />
                                            Vị trí
                                            <span className={styles.sortIcon}>{getSortIcon('jobTitle')}</span>
                                        </th>
                                        <th
                                            className={styles.table_th}
                                            onClick={() => handleSort('createdAt')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <FaClock className="me-1" />
                                            Ngày tạo
                                            <span className={styles.sortIcon}>{getSortIcon('createdAt')}</span>
                                        </th>
                                        <th
                                            className={styles.table_th}
                                            onClick={() => handleSort('status')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <FaClipboardCheck className="me-1" />
                                            Trạng thái
                                            <span className={styles.sortIcon}>{getSortIcon('status')}</span>
                                        </th>
                                        <th className={styles.table_th}>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInterviews.map((interview) => (
                                        <tr key={interview.id} className={`${styles.rowHover} ${styles.tableRow}`}>
                                            <td className={styles.table_td}>
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={selectedInterviews.includes(interview.id)}
                                                    onChange={() => {
                                                        setSelectedInterviews(prev =>
                                                            prev.includes(interview.id)
                                                                ? prev.filter(id => id !== interview.id)
                                                                : [...prev, interview.id]
                                                        );
                                                    }}
                                                />
                                            </td>
                                            <td className={styles.table_td}>
                                                <div className={styles.candidateInfo}>
                                                    <div className={styles.candidateName}>{interview.candidateName}</div>
                                                    <div className={styles.candidateEmail}>
                                                        <FaEnvelope className="me-1" />
                                                        {interview.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={styles.table_td}>
                                                <Badge bg="light" text="dark" className={styles.positionBadge}>
                                                    <FaBuilding className="me-1" />
                                                    {interview.jobTitle}
                                                </Badge>
                                            </td>
                                            <td className={styles.table_td}>
                                                <div className="text-center">
                                                    <div className="fw-semibold">
                                                        {new Date(interview.createdAt).toLocaleDateString('vi-VN')}
                                                    </div>
                                                    <small className="text-muted d-flex align-items-center justify-content-center mt-1">
                                                        <FaRegClock className="me-1" />
                                                        {Math.ceil((new Date() - new Date(interview.createdAt)) / (1000 * 60 * 60 * 24))} ngày trước
                                                    </small>
                                                </div>
                                            </td>
    
                                            <td className={styles.table_td}>
                                                {getStatusBadge(interview.status)}
                                            </td>
                                            <td className={styles.table_td}>
                                                <div className={styles.actionButtons}>
                                                    <OverlayTrigger
                                                        placement="top"
                                                        overlay={<Tooltip>Xem chi tiết</Tooltip>}
                                                    >
                                                        <Button
                                                            variant="outline-info"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedInterview(interview);
                                                                setShowDetailModal(true);
                                                            }}
                                                            className={styles.btn_outline_info}
                                                        >
                                                            <FaEye />
                                                        </Button>
                                                    </OverlayTrigger>
                                                    {interview.status === 'pending' && (
                                                        <>
                                                            <OverlayTrigger
                                                                placement="top"
                                                                overlay={<Tooltip>Cập nhật trạng thái</Tooltip>}
                                                            >
                                                                <Button
                                                                    variant="outline-success"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedInterview(interview);
                                                                        setNewStatus('');
                                                                        setStatusNote('');
                                                                        setShowStatusModal(true);
                                                                    }}
                                                                    className={styles.btn_outline_success}
                                                                >
                                                                    <FaEdit />
                                                                </Button>
                                                            </OverlayTrigger>
                                                            <OverlayTrigger
                                                                placement="top"
                                                                overlay={<Tooltip>Dời lịch</Tooltip>}
                                                            >
                                                                <Button
                                                                    variant="outline-warning"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedInterview(interview);
                                                                        setRescheduleDate('');
                                                                        setRescheduleTime('');
                                                                        setRescheduleNote('');
                                                                        setShowRescheduleModal(true);
                                                                    }}
                                                                    className={styles.btn_outline_warning}
                                                                >
                                                                    <FaHistory />
                                                                </Button>
                                                            </OverlayTrigger>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Card>
                )}

                {/* Detail Modal */}
                <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" className={styles.modal_content}>
                    <Modal.Header closeButton className={styles.modal_header}>
                        <Modal.Title>
                            <FaUser className="me-2" />
                            Chi tiết phỏng vấn
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={styles.modalForm}>
                        {selectedInterview && (
                            <Row>
                                <Col md={8}>
                                    <Card className="border-0">
                                        <Card.Body>
                                            <h5 className="mb-3">
                                                <FaUserGraduate className="me-2 text-primary" />
                                                {selectedInterview.candidateName}
                                            </h5>

                                            <div className="mb-3">
                                                <strong><FaEnvelope className="me-2 text-info" />Email:</strong>
                                                <span className="ms-2">{selectedInterview.email}</span>
                                            </div>

                                            <div className="mb-3">
                                                <strong><FaBuilding className="me-2 text-success" />Vị trí ứng tuyển:</strong>
                                                <Badge bg="primary" className="ms-2">{selectedInterview.jobTitle}</Badge>
                                            </div>

                                            <div className="mb-3">
                                                <strong><FaClock className="me-2 text-warning" />Ngày tạo:</strong>
                                                <span className="ms-2">
                                                    {new Date(selectedInterview.createdAt).toLocaleString('vi-VN')}
                                                </span>
                                            </div>

                                            <div className="mb-3">
                                                <strong><FaClipboardCheck className="me-2" />Trạng thái:</strong>
                                                <span className="ms-2">{getStatusBadge(selectedInterview.status)}</span>
                                            </div>

                                            {selectedInterview.note && (
                                                <div className="mb-3">
                                                    <strong><FaFileAlt className="me-2 text-secondary" />Ghi chú:</strong>
                                                    <div className="ms-2 mt-2 p-2 bg-light rounded">
                                                        {selectedInterview.note}
                                                    </div>
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className="border-0 bg-light">
                                        <Card.Body>
                                            <h6 className="mb-3">Hành động nhanh</h6>
                                            {selectedInterview.status === 'pending' && (
                                                <div className="d-grid gap-2">
                                                    <Button
                                                        variant="success"
                                                        onClick={() => {
                                                            setShowDetailModal(false);
                                                            setNewStatus('');
                                                            setStatusNote('');
                                                            setShowStatusModal(true);
                                                        }}
                                                    >
                                                        <FaEdit className="me-1" />
                                                        Cập nhật trạng thái
                                                    </Button>
                                                    <Button
                                                        variant="warning"
                                                        onClick={() => {
                                                            setShowDetailModal(false);
                                                            setRescheduleDate('');
                                                            setRescheduleTime('');
                                                            setRescheduleNote('');
                                                            setShowRescheduleModal(true);
                                                        }}
                                                    >
                                                        <FaHistory className="me-1" />
                                                        Dời lịch
                                                    </Button>
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                            Đóng
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Status Update Modal */}
                <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} size="lg" className={styles.modal_content}>
                    <Modal.Header closeButton className={styles.modal_header}>
                        <Modal.Title>
                            <FaEdit className="me-2" />
                            {selectedInterview ? `Cập nhật trạng thái - ${selectedInterview.candidateName}` : `Cập nhật hàng loạt (${selectedInterviews.length} phỏng vấn)`}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={styles.modalForm}>
                        {selectedInterview && (
                            <Alert variant="info" className="mb-3">
                                <strong>Ứng viên:</strong> {selectedInterview.candidateName} - {selectedInterview.email}<br />
                                <strong>Vị trí:</strong> {selectedInterview.jobTitle}
                            </Alert>
                        )}
                        {selectedInterviews.length > 0 && !selectedInterview && (
                            <Alert variant="info" className="mb-3">
                                Bạn đang cập nhật trạng thái cho <strong>{selectedInterviews.length} cuộc phỏng vấn</strong> cùng lúc.
                            </Alert>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                                <FaClipboardCheck className="me-1" />
                                Trạng thái mới:
                            </Form.Label>
                            <Form.Select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                required
                            >
                                <option value="">Chọn trạng thái</option>
                                <option value="accepted">Đã xác nhận</option>
                                <option value="declined">Từ chối</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                <FaFileAlt className="me-1" />
                                Ghi chú:
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={statusNote}
                                onChange={(e) => setStatusNote(e.target.value)}
                                placeholder="Nhập ghi chú cho việc cập nhật trạng thái..."
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
                            <FaTimes className="me-1" />
                            Hủy
                        </Button>
                        <Button
                            variant="success"
                            onClick={handleUpdateStatus}
                            disabled={!newStatus}
                            className={styles.modal_footer_btn_success}
                        >
                            <FaCheck className="me-1" />
                            Cập nhật trạng thái
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Reschedule Modal */}
                <Modal show={showRescheduleModal} onHide={() => setShowRescheduleModal(false)} size="lg" className={styles.modal_content}>
                    <Modal.Header closeButton className={styles.modal_header}>
                        <Modal.Title>
                            <FaHistory className="me-2" />
                            Dời lịch phỏng vấn - {selectedInterview?.candidateName}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={styles.modalForm}>
                        {selectedInterview && (
                            <Alert variant="warning" className="mb-3">
                                <strong>Ứng viên:</strong> {selectedInterview.candidateName} - {selectedInterview.email}<br />
                                <strong>Vị trí:</strong> {selectedInterview.jobTitle}
                            </Alert>
                        )}

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">
                                        <FaCalendarAlt className="me-1" />
                                        Ngày mới:
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={rescheduleDate}
                                        onChange={(e) => setRescheduleDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">
                                        <FaClock className="me-1" />
                                        Giờ mới:
                                    </Form.Label>
                                    <Form.Control
                                        type="time"
                                        value={rescheduleTime}
                                        onChange={(e) => setRescheduleTime(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                <FaFileAlt className="me-1" />
                                Lý do dời lịch:
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={rescheduleNote}
                                onChange={(e) => setRescheduleNote(e.target.value)}
                                placeholder="Nhập lý do dời lịch phỏng vấn..."
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowRescheduleModal(false)}>
                            <FaTimes className="me-1" />
                            Hủy
                        </Button>
                        <Button
                            variant="warning"
                            onClick={handleReschedule}
                            disabled={!rescheduleDate || !rescheduleTime || !rescheduleNote.trim()}
                        >
                            <FaCheck className="me-1" />
                            Xác nhận dời lịch
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Statistics Modal */}
                <Modal show={showStatsModal} onHide={() => setShowStatsModal(false)} size="xl" className={styles.modal_content}>
                    <Modal.Header closeButton className={styles.modal_header}>
                        <Modal.Title>
                            <FaChartBar className="me-2" />
                            Thống kê chi tiết phỏng vấn
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={styles.modalForm}>
                        {statistics && (
                            <Row>
                                <Col md={6}>
                                    <Card className="mb-4">
                                        <Card.Header>
                                            <h6><FaUsers className="me-2" />Tổng quan phỏng vấn</h6>
                                        </Card.Header>
                                        <Card.Body>
                                            <Row className="text-center">
                                                <Col xs={6} className="mb-3">
                                                    <div className="border-end">
                                                        <h3 className="text-primary mb-1">{statistics.total}</h3>
                                                        <small className="text-muted">Tổng phỏng vấn</small>
                                                    </div>
                                                </Col>
                                                <Col xs={6} className="mb-3">
                                                    <div>
                                                        <h3 className="text-warning mb-1">{statistics.pending}</h3>
                                                        <small className="text-muted">Chờ xác nhận</small>
                                                    </div>
                                                </Col>
                                                <Col xs={6}>
                                                    <div className="border-end">
                                                        <h3 className="text-success mb-1">{statistics.accepted}</h3>
                                                        <small className="text-muted">Đã xác nhận</small>
                                                    </div>
                                                </Col>
                                                <Col xs={6}>
                                                    <div>
                                                        <h3 className="text-danger mb-1">{statistics.declined}</h3>
                                                        <small className="text-muted">Từ chối</small>
                                                    </div>
                                                </Col>
                                            </Row>

                                            <div className="mt-3">
                                                <div className="mb-2">
                                                    <small className="text-muted">Tỷ lệ xác nhận</small>
                                                    <ProgressBar
                                                        variant="success"
                                                        now={statistics.total > 0 ? (statistics.accepted / statistics.total) * 100 : 0}
                                                        label={`${statistics.total > 0 ? Math.round((statistics.accepted / statistics.total) * 100) : 0}%`}
                                                    />
                                                </div>
                                                <div>
                                                    <small className="text-muted">Tỷ lệ từ chối</small>
                                                    <ProgressBar
                                                        variant="danger"
                                                        now={statistics.total > 0 ? (statistics.declined / statistics.total) * 100 : 0}
                                                        label={`${statistics.total > 0 ? Math.round((statistics.declined / statistics.total) * 100) : 0}%`}
                                                    />
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={6}>
                                    <Card>
                                        <Card.Header>
                                            <h6><FaStar className="me-2" />Top vị trí phỏng vấn</h6>
                                        </Card.Header>
                                        <Card.Body>
                                            {statistics.topJobs.length > 0 ? (
                                                statistics.topJobs.map((job, index) => (
                                                    <div key={index} className="mb-3">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span className="fw-semibold">
                                                                #{index + 1} {job.job}
                                                            </span>
                                                            <Badge bg="primary">{job.count} phỏng vấn</Badge>
                                                        </div>
                                                        <ProgressBar
                                                            variant="info"
                                                            now={(job.count / statistics.total) * 100}
                                                            className="mt-1"
                                                            style={{ height: '8px' }}
                                                        />
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-muted text-center">Chưa có dữ liệu</p>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-success" onClick={handleExportExcel}>
                            <FaFileExcel className="me-1" />
                            Xuất báo cáo Excel
                        </Button>
                        <Button variant="secondary" onClick={() => setShowStatsModal(false)}>
                            Đóng
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default InterviewManagement;