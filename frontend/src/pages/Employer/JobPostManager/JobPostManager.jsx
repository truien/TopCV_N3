import React, { useEffect, useState } from 'react';
import {
    Container, Tabs, Tab, Table, Badge, Button, Modal, Alert, Spinner
} from 'react-bootstrap';
import { getJobPostsWithPackage, updateJobPostStatus, deleteJobPost } from '@/api/jobApi';
import BuyPackageModal from '@/components/BuyPackageModal/BuyPackageModal';
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

    return (
        <Container className="mt-4">
            <h3 className={styles.title}>Quản lý bài viết tuyển dụng</h3>

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

            {/* Modal Chi tiết gói */}
            <PackageDetailModal
                show={!!packageDetail}
                onClose={() => setPackageDetail(null)}
                packageInfo={packageDetail}
            />
        </Container>
    );
};

export default JobPostManager;
