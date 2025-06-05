import { useEffect, useState, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import RichTextEditor from '../../../components/RichTextEditor/RichTextEditor';
import styles from './ApplicantManagement.module.css';
import DOMPurify from 'dompurify';
import { getApplicationsForEmployer, rejectApplication } from '@/api/applicationApi';
import { scheduleInterview } from '@/api/interviewApi';
import {
    Container, Row, Col, Card, Table, Badge, Button, Modal, Alert, Spinner,
    Form, InputGroup, Dropdown, ButtonGroup, ProgressBar, Tabs, Tab
} from 'react-bootstrap';
import {
    FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown, FaEye, FaEdit,
    FaTrash, FaCheck, FaTimes, FaCalendarAlt, FaEnvelope, FaUser,
    FaBuilding, FaClock, FaFileAlt, FaDownload, FaChartBar, FaUsers,
    FaClipboardCheck, FaExclamationTriangle, FaFileExcel, FaPrint,
    FaUserGraduate, FaPhone, FaMapMarkerAlt, FaStar, FaRegClock
} from 'react-icons/fa';
import * as XLSX from 'xlsx';


const ApplicantManagement = () => {
    const [applications, setApplications] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [interviewMessage, setInterviewMessage] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [selectedApps, setSelectedApps] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filter and Search states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [sortField, setSortField] = useState('appliedAt');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentTab, setCurrentTab] = useState('pending');

    // Statistics
    const [statistics, setStatistics] = useState(null);

    const calculateStatistics = useCallback((applicationsData) => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const stats = {
            total: applicationsData.length,
            pending: applicationsData.filter(app => app.status === "0").length,
            interviewed: applicationsData.filter(app => app.status === "1").length,
            rejected: applicationsData.filter(app => app.status === "2").length,
            recentApplications: applicationsData.filter(app => new Date(app.appliedAt) > oneWeekAgo).length,
            monthlyApplications: applicationsData.filter(app => new Date(app.appliedAt) > oneMonthAgo).length,
            avgResponseTime: calculateAverageResponseTime(applicationsData),
            topPositions: getTopPositions(applicationsData)
        };
        setStatistics(stats);
    }, []);

    const calculateAverageResponseTime = (applicationsData) => {
        const processedApps = applicationsData.filter(app => app.status !== "0");
        if (processedApps.length === 0) return 0;

        const totalDays = processedApps.reduce((sum, app) => {
            const appliedDate = new Date(app.appliedAt);
            const processedDate = new Date(app.updatedAt || app.appliedAt);
            const diffDays = Math.ceil((processedDate - appliedDate) / (1000 * 60 * 60 * 24));
            return sum + diffDays;
        }, 0);

        return Math.round(totalDays / processedApps.length);
    };

    const getTopPositions = (applicationsData) => {
        const positionCounts = {};
        applicationsData.forEach(app => {
            positionCounts[app.jobTitle] = (positionCounts[app.jobTitle] || 0) + 1;
        });

        return Object.entries(positionCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([position, count]) => ({ position, count }));
    };

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const data = await getApplicationsForEmployer();
            setApplications(data);
            calculateStatistics(data);
        } catch (err) {
            toast.error("Không thể tải danh sách ứng viên.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredApplications = useMemo(() => {
        let filtered = applications;

        // Filter by tab
        if (currentTab !== 'all') {
            const statusMap = {
                'pending': '0',
                'interviewed': '1',
                'rejected': '2'
            };
            filtered = filtered.filter(app => app.status === statusMap[currentTab]);
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(app => app.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(app =>
                app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
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
                filtered = filtered.filter(app => new Date(app.appliedAt) >= filterDate);
            }
        }

        // Sort
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortField) {
                case 'fullName':
                    aValue = a.fullName.toLowerCase();
                    bValue = b.fullName.toLowerCase();
                    break;
                case 'appliedAt':
                    aValue = new Date(a.appliedAt);
                    bValue = new Date(b.appliedAt);
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
    }, [applications, currentTab, statusFilter, searchTerm, dateFilter, sortField, sortDirection]);

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
    }; const getStatusBadge = (status) => {
        const statusMap = {
            '0': { text: 'Chờ xử lý', className: `${styles.statusBadge} ${styles.pending}`, icon: <FaClock /> },
            '1': { text: 'Đã phỏng vấn', className: `${styles.statusBadge} ${styles.interviewed}`, icon: <FaCheck /> },
            '2': { text: 'Đã từ chối', className: `${styles.statusBadge} ${styles.rejected}`, icon: <FaTimes /> }
        };

        const statusInfo = statusMap[status] || { text: 'Không xác định', className: styles.statusBadge, icon: null };

        return (
            <span className={statusInfo.className}>
                {statusInfo.icon} {statusInfo.text}
            </span>
        );
    };

    const exportToExcel = () => {
        if (filteredApplications.length === 0) {
            toast.warning('Không có dữ liệu để xuất');
            return;
        }

        const exportData = filteredApplications.map(app => ({
            'Họ tên': app.fullName,
            'Email': app.email,
            'Vị trí ứng tuyển': app.jobTitle,
            'Ngày ứng tuyển': new Date(app.appliedAt).toLocaleDateString('vi-VN'),
            'Trạng thái': app.status === '0' ? 'Chờ xử lý' : app.status === '1' ? 'Đã phỏng vấn' : 'Đã từ chối',
            'CV': app.cvUrl ? 'Có' : 'Không có',
            'Lý do từ chối': app.rejectReason || '-'
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Danh sách ứng viên');
        XLSX.writeFile(wb, `ung-vien-${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Đã xuất file Excel thành công');
    };

    const handleOpenInterview = (app) => {
        setSelectedApp(app);
        setInterviewMessage('');
        setShowInterviewModal(true);
    };

    const handleScheduleInterview = async () => {
        try {
            const ids = selectedApps.length > 0
                ? selectedApps
                : [selectedApp.id];

            const idsToProcess = ids.filter(id =>
                filteredApplications.some(app => app.id === id && app.status === "0")
            );

            await Promise.all(idsToProcess.map(id => {
                const app = applications.find(a => a.id === id);
                return scheduleInterview({
                    applicationId: app.id,
                    message: interviewMessage,
                });
            }));

            toast.success(`Đã mời phỏng vấn ${idsToProcess.length} ứng viên.`);
            setShowInterviewModal(false);
            setSelectedApps([]);
            fetchApplications();
        } catch (err) {
            toast.error("Lỗi khi tạo lịch phỏng vấn.");
            console.error(err);
        }
    };

    const handleOpenReject = (app) => {
        setSelectedApp(app);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const handleReject = async () => {
        try {
            const ids = selectedApps.length > 0
                ? selectedApps
                : [selectedApp.id];

            const idsToReject = ids.filter(id =>
                filteredApplications.some(app => app.id === id && app.status === "0")
            );

            await Promise.all(idsToReject.map(id =>
                rejectApplication(id, rejectReason)
            ));

            toast.success(`Đã từ chối ${idsToReject.length} ứng viên.`);
            setShowRejectModal(false);
            setSelectedApps([]);
            fetchApplications();
        } catch (err) {
            toast.error("Lỗi khi từ chối ứng viên.");
            console.error(err);
        }
    };

    const pendingApps = filteredApplications.filter(app => app.status === "0");

    return (
        <Container className={`mt-4 ${styles.wrapper}`}>            <Row className="mb-4">
            <Col>
                <div className={styles.header}>
                    <h3 className={styles.h3_title}>
                        <FaUsers />
                        Quản lý ứng viên
                    </h3>
                    <p className={styles.subtitle}>
                        Quản lý và theo dõi tất cả ứng viên của công ty một cách hiệu quả
                    </p>
                </div>
            </Col>
        </Row>{/* Statistics Cards */}
            {statistics && (
                <Row className={`mb-4 ${styles.statsContainer}`}>
                    <Col md={3}>
                        <Card className={`${styles.statCard} h-100`}>
                            <Card.Body className="text-center">
                                <div className={`${styles.statIcon} ${styles.total}`}>
                                    <FaUsers size={24} />
                                </div>
                                <div className={styles.statValue}>{statistics.total}</div>
                                <div className={styles.statLabel}>Tổng ứng viên</div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className={`${styles.statCard} h-100`}>
                            <Card.Body className="text-center">
                                <div className={`${styles.statIcon} ${styles.pending}`}>
                                    <FaClock size={24} />
                                </div>
                                <div className={styles.statValue}>{statistics.pending}</div>
                                <div className={styles.statLabel}>Chờ xử lý</div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className={`${styles.statCard} h-100`}>
                            <Card.Body className="text-center">
                                <div className={`${styles.statIcon} ${styles.interviewed}`}>
                                    <FaCheck size={24} />
                                </div>
                                <div className={styles.statValue}>{statistics.interviewed}</div>
                                <div className={styles.statLabel}>Đã phỏng vấn</div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className={`${styles.statCard} h-100`}>
                            <Card.Body className="text-center">
                                <div className={`${styles.statIcon} ${styles.rejected}`}>
                                    <FaTimes size={24} />
                                </div>
                                <div className={styles.statValue}>{statistics.rejected}</div>
                                <div className={styles.statLabel}>Đã từ chối</div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}            {/* Search and Filter Controls */}
            <Card className={`mb-4 ${styles.controlsSection}`}>
                <Card.Body>
                    <Row className="align-items-end">
                        <Col md={4}>
                            <Form.Label>Tìm kiếm</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FaSearch />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Tìm theo tên, email, vị trí..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={styles.searchInput}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={2}>
                            <Form.Label>Trạng thái</Form.Label>
                            <Form.Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="all">Tất cả</option>
                                <option value="0">Chờ xử lý</option>
                                <option value="1">Đã phỏng vấn</option>
                                <option value="2">Đã từ chối</option>
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Form.Label>Thời gian</Form.Label>
                            <Form.Select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="all">Tất cả</option>
                                <option value="today">Hôm nay</option>
                                <option value="week">7 ngày qua</option>
                                <option value="month">30 ngày qua</option>
                            </Form.Select>
                        </Col>                    <Col md={4}>
                            <div className="d-flex gap-2 flex-wrap">
                                <Button
                                    variant="outline-primary"
                                    onClick={() => setShowStatsModal(true)}
                                    className="d-flex align-items-center"
                                >
                                    <FaChartBar className="me-2" />
                                    Thống kê chi tiết
                                </Button>
                                <Button
                                    variant="outline-success"
                                    onClick={exportToExcel}
                                    className="d-flex align-items-center"
                                >
                                    <FaFileExcel className="me-2" />
                                    Xuất Excel
                                </Button>
                                <Button
                                    variant="success"
                                    disabled={selectedApps.length === 0}
                                    onClick={() => {
                                        setSelectedApp(null);
                                        setInterviewMessage('');
                                        setShowInterviewModal(true);
                                    }}
                                    className="d-flex align-items-center"
                                >
                                    <FaCalendarAlt className="me-2" />
                                    Mời PV ({selectedApps.length})
                                </Button>
                                <Button
                                    variant="danger"
                                    disabled={selectedApps.length === 0}
                                    onClick={() => {
                                        setSelectedApp(null);
                                        setRejectReason('');
                                        setShowRejectModal(true);
                                    }}
                                    className="d-flex align-items-center"
                                >
                                    <FaTimes className="me-2" />
                                    Từ chối ({selectedApps.length})
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Tabs */}
            <Tabs
                activeKey={currentTab}
                onSelect={setCurrentTab}
                className="mb-3"
                fill
            >
                <Tab eventKey="all" title={`Tất cả (${applications.length})`} />
                <Tab eventKey="pending" title={`Chờ xử lý (${statistics?.pending || 0})`} />
                <Tab eventKey="interviewed" title={`Đã phỏng vấn (${statistics?.interviewed || 0})`} />
                <Tab eventKey="rejected" title={`Đã từ chối (${statistics?.rejected || 0})`} />
            </Tabs>            {/* Main Content */}            {loading ? (
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <p>Đang tải dữ liệu ứng viên...</p>
                </div>) : filteredApplications.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FaExclamationTriangle size={80} />
                        <h4>Không có ứng viên nào</h4>
                        <p>Hiện tại không có ứng viên nào phù hợp với bộ lọc đã chọn. Hãy thử điều chỉnh các tiêu chí tìm kiếm.</p>
                    </div>) : (
                <div className={styles.tableContainer}>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th className={styles.table_th}>
                                    <Form.Check
                                        type="checkbox"
                                        onChange={e => setSelectedApps(
                                            e.target.checked
                                                ? pendingApps.map(a => a.id)
                                                : []
                                        )}
                                        checked={
                                            pendingApps.length > 0 &&
                                            selectedApps.length === pendingApps.length
                                        }
                                    />
                                </th>
                                <th
                                    className={styles.table_th}
                                    onClick={() => handleSort('fullName')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <FaUser className="me-1" />
                                    Ứng viên
                                    <span className={styles.sortIcon}>{getSortIcon('fullName')}</span>
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
                                    onClick={() => handleSort('appliedAt')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <FaClock className="me-1" />
                                    Ngày ứng tuyển
                                    <span className={styles.sortIcon}>{getSortIcon('appliedAt')}</span>
                                </th>
                                <th className={styles.table_th}>
                                    <FaFileAlt className="me-1" />
                                    CV
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
                        <tbody>                            {filteredApplications.map((app) => (
                            <tr key={app.id} className={`${styles.rowHover} ${styles.tableRow}`}>
                                <td className={styles.table_td}>
                                    {app.status === "0" && (
                                        <Form.Check
                                            type="checkbox"
                                            checked={selectedApps.includes(app.id)}
                                            onChange={() => {
                                                setSelectedApps(prev =>
                                                    prev.includes(app.id)
                                                        ? prev.filter(id => id !== app.id)
                                                        : [...prev, app.id]
                                                );
                                            }}
                                        />
                                    )}
                                </td>
                                <td className={styles.table_td}>
                                    <div className={styles.candidateInfo}>
                                        <div className={styles.candidateName}>{app.fullName}</div>
                                        <div className={styles.candidateEmail}>
                                            <FaEnvelope className="me-1" />
                                            {app.email}
                                        </div>
                                    </div>
                                </td>                                    <td className={styles.table_td}>
                                    <Badge bg="light" text="dark" className={styles.positionBadge}>
                                        <FaBuilding className="me-1" />
                                        {app.jobTitle}
                                    </Badge>
                                </td>                                    <td className={styles.table_td}>
                                    <div className="text-center">
                                        <div className="fw-semibold">
                                            {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                                        </div>
                                        <small className="text-muted d-flex align-items-center justify-content-center mt-1">
                                            <FaRegClock className="me-1" />
                                            {Math.ceil((new Date() - new Date(app.appliedAt)) / (1000 * 60 * 60 * 24))} ngày trước
                                        </small>
                                    </div>
                                </td>                                    <td className={styles.table_td}>
                                    {app.cvUrl ? (
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => window.open(app.cvUrl, '_blank')}
                                            className="d-flex align-items-center"
                                        >
                                            <FaDownload className="me-1" />
                                            Xem CV
                                        </Button>
                                    ) : (
                                        <span className="text-muted d-flex align-items-center justify-content-center">
                                            <FaFileAlt className="me-1 opacity-50" />
                                            Không có
                                        </span>
                                    )}
                                </td>
                                <td className={styles.table_td}>
                                    {getStatusBadge(app.status)}
                                </td>
                                <td className={styles.table_td}>
                                    <div className={styles.actionButtons}>
                                        <Button
                                            variant="outline-info"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedApp(app);
                                                setShowDetailModal(true);
                                            }}
                                            title="Xem chi tiết"
                                            className={styles.btn_outline_info}
                                        >
                                            <FaEye />
                                        </Button>
                                        {app.status === '0' && (
                                            <>
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    onClick={() => handleOpenInterview(app)}
                                                    title="Mời phỏng vấn"
                                                    className={styles.btn_outline_success}
                                                >
                                                    <FaCalendarAlt />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleOpenReject(app)}
                                                    title="Từ chối"
                                                    className={styles.btn_outline_danger}
                                                >
                                                    <FaTimes />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* Modals */}
            {/* Interview Modal */}
            <Modal show={showInterviewModal} onHide={() => setShowInterviewModal(false)} size="lg" className={styles.modal_content}>
                <Modal.Header closeButton className={styles.modal_header}>
                    <Modal.Title>
                        <FaCalendarAlt className="me-2" />
                        {selectedApp ? `Mời phỏng vấn - ${selectedApp.fullName}` : `Mời phỏng vấn hàng loạt (${selectedApps.length} ứng viên)`}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={styles.modalForm}>
                    {selectedApp && (
                        <Alert variant="info" className="mb-3">
                            <strong>Ứng viên:</strong> {selectedApp.fullName} - {selectedApp.email}<br />
                            <strong>Vị trí:</strong> {selectedApp.jobTitle}
                        </Alert>
                    )}
                    {selectedApps.length > 0 && !selectedApp && (
                        <Alert variant="info" className="mb-3">
                            Bạn đang mời phỏng vấn <strong>{selectedApps.length} ứng viên</strong> cùng lúc.
                        </Alert>
                    )}
                    <Form.Label className="fw-semibold">
                        <FaEnvelope className="me-1" />
                        Nội dung thư mời phỏng vấn:
                    </Form.Label>
                    <RichTextEditor
                        value={interviewMessage}
                        onChange={setInterviewMessage}
                        placeholder="Nhập nội dung thư mời phỏng vấn..."
                    />
                </Modal.Body>
                <Modal.Footer>                    <Button variant="secondary" onClick={() => setShowInterviewModal(false)}>
                    <FaTimes className="me-1" />
                    Hủy
                </Button>
                    <Button
                        variant="success"
                        onClick={handleScheduleInterview}
                        disabled={!interviewMessage.trim()}
                        className={styles.modal_footer_btn_success}
                    >
                        <FaCheck className="me-1" />
                        Gửi thư mời
                    </Button>                </Modal.Footer>
            </Modal>

            {/* Reject Modal */}
            <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} size="lg" className={styles.modal_content}>
                <Modal.Header closeButton className={styles.modal_header}>
                    <Modal.Title>
                        <FaTimes className="me-2" />
                        {selectedApp ? `Từ chối ứng viên - ${selectedApp.fullName}` : `Từ chối hàng loạt (${selectedApps.length} ứng viên)`}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={styles.modalForm}>
                    {selectedApp && (
                        <Alert variant="warning" className="mb-3">
                            <strong>Ứng viên:</strong> {selectedApp.fullName} - {selectedApp.email}<br />
                            <strong>Vị trí:</strong> {selectedApp.jobTitle}
                        </Alert>
                    )}
                    {selectedApps.length > 0 && !selectedApp && (
                        <Alert variant="warning" className="mb-3">
                            Bạn đang từ chối <strong>{selectedApps.length} ứng viên</strong> cùng lúc.
                        </Alert>
                    )}
                    <Form.Label className="fw-semibold">
                        <FaExclamationTriangle className="me-1" />
                        Lý do từ chối:
                    </Form.Label>
                    <RichTextEditor
                        value={rejectReason}
                        onChange={setRejectReason}
                        placeholder="Nhập lý do từ chối ứng viên..."
                    />
                </Modal.Body>
                <Modal.Footer>                    <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
                    <FaTimes className="me-1" />
                    Hủy
                </Button>
                    <Button
                        variant="danger"
                        onClick={handleReject}
                        disabled={!rejectReason.trim()}
                    >
                        <FaCheck className="me-1" />
                        Xác nhận từ chối
                    </Button>                </Modal.Footer>
            </Modal>

            {/* Candidate Detail Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" className={styles.modal_content}>
                <Modal.Header closeButton className={styles.modal_header}>
                    <Modal.Title>
                        <FaUser className="me-2" />
                        Chi tiết ứng viên
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={styles.modalForm}>
                    {selectedApp && (
                        <Row>
                            <Col md={8}>
                                <Card className="border-0">
                                    <Card.Body>
                                        <h5 className="mb-3">
                                            <FaUserGraduate className="me-2 text-primary" />
                                            {selectedApp.fullName}
                                        </h5>

                                        <div className="mb-3">
                                            <strong><FaEnvelope className="me-2 text-info" />Email:</strong>
                                            <span className="ms-2">{selectedApp.email}</span>
                                        </div>

                                        <div className="mb-3">
                                            <strong><FaBuilding className="me-2 text-success" />Vị trí ứng tuyển:</strong>
                                            <Badge bg="primary" className="ms-2">{selectedApp.jobTitle}</Badge>
                                        </div>

                                        <div className="mb-3">
                                            <strong><FaClock className="me-2 text-warning" />Ngày ứng tuyển:</strong>
                                            <span className="ms-2">
                                                {new Date(selectedApp.appliedAt).toLocaleDateString('vi-VN')}
                                                ({Math.ceil((new Date() - new Date(selectedApp.appliedAt)) / (1000 * 60 * 60 * 24))} ngày trước)
                                            </span>
                                        </div>

                                        <div className="mb-3">
                                            <strong><FaClipboardCheck className="me-2" />Trạng thái:</strong>
                                            <span className="ms-2">{getStatusBadge(selectedApp.status)}</span>
                                        </div>

                                        <div className="mb-3">
                                            <strong><FaFileAlt className="me-2 text-secondary" />CV:</strong>
                                            {selectedApp.cvUrl ? (
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="ms-2"
                                                    onClick={() => window.open(selectedApp.cvUrl, '_blank')}
                                                >
                                                    <FaDownload className="me-1" />
                                                    Tải xuống CV
                                                </Button>
                                            ) : (
                                                <span className="ms-2 text-muted">Không có CV</span>
                                            )}
                                        </div>

                                        {selectedApp.status === "2" && selectedApp.rejectReason && (
                                            <div className="mb-3">
                                                <strong><FaExclamationTriangle className="me-2 text-danger" />Lý do từ chối:</strong>
                                                <div
                                                    className="ms-2 mt-2 p-2 bg-light rounded"
                                                    dangerouslySetInnerHTML={{
                                                        __html: DOMPurify.sanitize(selectedApp.rejectReason)
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="border-0 bg-light">
                                    <Card.Body>
                                        <h6 className="mb-3">Hành động nhanh</h6>
                                        {selectedApp.status === '0' && (
                                            <div className="d-grid gap-2">
                                                <Button
                                                    variant="success"
                                                    onClick={() => {
                                                        setShowDetailModal(false);
                                                        handleOpenInterview(selectedApp);
                                                    }}
                                                >
                                                    <FaCalendarAlt className="me-1" />
                                                    Mời phỏng vấn
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    onClick={() => {
                                                        setShowDetailModal(false);
                                                        handleOpenReject(selectedApp);
                                                    }}
                                                >
                                                    <FaTimes className="me-1" />
                                                    Từ chối
                                                </Button>
                                            </div>
                                        )}
                                        {selectedApp.cvUrl && (
                                            <Button
                                                variant="outline-primary"
                                                className="w-100 mt-2"
                                                onClick={() => window.open(selectedApp.cvUrl, '_blank')}
                                            >
                                                <FaDownload className="me-1" />
                                                Xem CV
                                            </Button>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Đóng
                    </Button>                </Modal.Footer>
            </Modal>

            {/* Statistics Modal */}
            <Modal show={showStatsModal} onHide={() => setShowStatsModal(false)} size="xl" className={styles.modal_content}>
                <Modal.Header closeButton className={styles.modal_header}>
                    <Modal.Title>
                        <FaChartBar className="me-2" />
                        Thống kê chi tiết
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={styles.modalForm}>
                    {statistics && (
                        <Row>
                            <Col md={6}>
                                <Card className="mb-4">
                                    <Card.Header>
                                        <h6><FaUsers className="me-2" />Tổng quan ứng viên</h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row className="text-center">
                                            <Col xs={6} className="mb-3">
                                                <div className="border-end">
                                                    <h3 className="text-primary mb-1">{statistics.total}</h3>
                                                    <small className="text-muted">Tổng ứng viên</small>
                                                </div>
                                            </Col>
                                            <Col xs={6} className="mb-3">
                                                <div>
                                                    <h3 className="text-warning mb-1">{statistics.pending}</h3>
                                                    <small className="text-muted">Chờ xử lý</small>
                                                </div>
                                            </Col>
                                            <Col xs={6}>
                                                <div className="border-end">
                                                    <h3 className="text-success mb-1">{statistics.interviewed}</h3>
                                                    <small className="text-muted">Đã phỏng vấn</small>
                                                </div>
                                            </Col>
                                            <Col xs={6}>
                                                <div>
                                                    <h3 className="text-danger mb-1">{statistics.rejected}</h3>
                                                    <small className="text-muted">Đã từ chối</small>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                                <Card>
                                    <Card.Header>
                                        <h6><FaClock className="me-2" />Hiệu suất xử lý</h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="mb-3">
                                            <div className="d-flex justify-content-between">
                                                <span>Thời gian phản hồi trung bình</span>
                                                <strong>{statistics.avgResponseTime} ngày</strong>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <div className="d-flex justify-content-between">
                                                <span>Ứng viên tuần này</span>
                                                <strong>{statistics.recentApplications}</strong>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <div className="d-flex justify-content-between">
                                                <span>Ứng viên tháng này</span>
                                                <strong>{statistics.monthlyApplications}</strong>
                                            </div>
                                        </div>

                                        {/* Progress bars */}
                                        <div className="mt-3">
                                            <div className="mb-2">
                                                <small className="text-muted">Tỷ lệ được phỏng vấn</small>
                                                <ProgressBar
                                                    variant="success"
                                                    now={statistics.total > 0 ? (statistics.interviewed / statistics.total) * 100 : 0}
                                                    label={`${statistics.total > 0 ? Math.round((statistics.interviewed / statistics.total) * 100) : 0}%`}
                                                />
                                            </div>
                                            <div>
                                                <small className="text-muted">Tỷ lệ từ chối</small>
                                                <ProgressBar
                                                    variant="danger"
                                                    now={statistics.total > 0 ? (statistics.rejected / statistics.total) * 100 : 0}
                                                    label={`${statistics.total > 0 ? Math.round((statistics.rejected / statistics.total) * 100) : 0}%`}
                                                />
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={6}>
                                <Card>
                                    <Card.Header>
                                        <h6><FaStar className="me-2" />Top vị trí ứng tuyển</h6>
                                    </Card.Header>
                                    <Card.Body>
                                        {statistics.topPositions.length > 0 ? (
                                            statistics.topPositions.map((position, index) => (
                                                <div key={index} className="mb-3">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="fw-semibold">
                                                            #{index + 1} {position.position}
                                                        </span>
                                                        <Badge bg="primary">{position.count} ứng viên</Badge>
                                                    </div>
                                                    <ProgressBar
                                                        variant="info"
                                                        now={(position.count / statistics.total) * 100}
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
                    <Button variant="outline-success" onClick={exportToExcel}>
                        <FaFileExcel className="me-1" />
                        Xuất báo cáo Excel
                    </Button>
                    <Button variant="secondary" onClick={() => setShowStatsModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ApplicantManagement;
