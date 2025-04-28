import React, { useEffect, useState } from 'react';
import {
    Container, Tabs, Tab, Table, Badge, Button, Modal, Alert, Spinner
} from 'react-bootstrap';
import { getJobPostsWithPackage, updateJobPostStatus, deleteJobPost } from '@/api/jobApi';
import { getProSubscription } from '@/api/userApi';
import BuyPackageModal from '@/components/BuyPackageModal/BuyPackageModal';
import BuyProModal from '@/components/BuyProModal/BuyProModal';
import PackageDetailModal from '@/components/PackageDetailModal/PackageDetailModal';
import { toast } from 'react-toastify';
import styles from './JobPostManager.module.css';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { GrServices } from "react-icons/gr";
import { RiDeleteBack2Line } from "react-icons/ri";

const JobPostManager = () => {
    const [posts, setPosts] = useState([]);
    const [tab, setTab] = useState('all');
    const [selectedJob, setSelectedJob] = useState(null);
    const [packageDetail, setPackageDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [proInfo, setProInfo] = useState(null);
    const [showBuyProModal, setShowBuyProModal] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const res = await getJobPostsWithPackage();
                setPosts(res);
            } catch {
                toast.error('Không thể tải bài viết');
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [refresh]);
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

    const filteredPosts = posts.filter(post => tab === 'all' || post.status === tab);

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
    };
    const daysLeft = proInfo?.isPro
        ? Math.ceil((new Date(proInfo.endDate) - new Date()) / (1000 * 60 * 60 * 24))
        : 0;

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
                )
            )}
            <Tabs activeKey={tab} onSelect={setTab} className="mb-3" fill>
                <Tab eventKey="all" title="Tất cả" />
                <Tab eventKey="open" title="Đang hoạt động" />
                <Tab eventKey="closed" title="Đã đóng" />
            </Tabs>

            {loading ? (
                <div className="text-center"><Spinner animation="border" /></div>
            ) : filteredPosts.length === 0 ? (
                <Alert variant="success">Không có bài viết nào</Alert>
            ) : (
                <Table striped bordered hover responsive className={`${styles.table} align-middle`}>
                    <thead>
                        <tr>
                            <th className={`${styles.table_th}`}>Tiêu đề</th>
                            <th className={`${styles.table_th}`}>Địa điểm</th>
                            <th className={`${styles.table_th}`}>Lương</th>
                            <th className={`${styles.table_th}`}>Hạn nộp</th>
                            <th className={`${styles.table_th}`}>Trạng thái</th>
                            <th className={`${styles.table_th}`}>Gói dịch vụ</th>
                            <th className={`${styles.table_th}`}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPosts.map(post => (
                            <tr key={post.id}>
                                <td className={`${styles.table_td}`}>{post.title}</td>
                                <td className={`${styles.table_td}`}>{post.location}</td>
                                <td className={`${styles.table_td}`}>{post.salaryRange}</td>
                                <td className={`${styles.table_td}`}>{new Date(post.applyDeadline).toLocaleDateString()}</td>
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
                                        {post.status === 'open' ? (
                                            <Button
                                                size="sm"
                                                className={styles.secondaryButton}
                                                onClick={() => handleClosePost(post.id)}
                                            >
                                                <FaRegEyeSlash />

                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                className={styles.secondaryButton}
                                                onClick={() => handleOpenPost(post.id)}
                                            >
                                                <FaRegEye />
                                            </Button>
                                        )}

                                        <Button
                                            size="sm"
                                            className={styles.topButton}
                                            onClick={() => setSelectedJob(post)}
                                        >
                                            <GrServices />
                                        </Button>

                                        <Button
                                            size="sm"
                                            className={styles.deleteButton}
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
            </Modal>

            <PackageDetailModal
                show={!!packageDetail}
                onClose={() => setPackageDetail(null)}
                packageInfo={packageDetail}
            />
            <BuyProModal onClose={() => setShowBuyProModal(false)} show={showBuyProModal} />
        </Container>
    );
};

export default JobPostManager;
