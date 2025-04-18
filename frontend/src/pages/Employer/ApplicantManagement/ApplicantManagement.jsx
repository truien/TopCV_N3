// ✅ Giao diện đã sửa: ApplicantManagement.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import RichTextEditor from '../../../components/RichTextEditor/RichTextEditor';
import styles from './ApplicantManagement.module.css';
import DOMPurify from 'dompurify';

const ApplicantManagement = () => {
    const [applications, setApplications] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [interviewMessage, setInterviewMessage] = useState('');
    const [rejectReason, setRejectReason] = useState('');

    const fetchApplications = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/applications/employer/all`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            setApplications(res.data);
        } catch (err) {
            toast.error("Không thể tải danh sách ứng viên.");
            console.error(err);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleOpenInterview = (app) => {
        setSelectedApp(app);
        setInterviewMessage('');
        setShowInterviewModal(true);
    };

    const handleScheduleInterview = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/interview/schedule`, {
                jobId: selectedApp.jobId,
                candidateUserId: selectedApp.userId,
                message: interviewMessage,
            }, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            toast.success("Đã mời phỏng vấn.");
            setShowInterviewModal(false);
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
            await axios.put(`${import.meta.env.VITE_API_URL}/api/applications/${selectedApp.id}/status`, {
                status: 2,
                rejectReason: rejectReason
            }, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            toast.success("Đã từ chối ứng viên.");
            setShowRejectModal(false);
            fetchApplications();
        } catch (err) {
            toast.error("Lỗi khi từ chối ứng viên.");
            console.error(err);
        }
    };

    return (
        <div className={`container ${styles.wrapper}`}>
            <h3 className={`mb-4 text-success ${styles.h3_title}`}>Quản lý hồ sơ ứng viên</h3>
            <table className='table table-hover'>
                <thead className='table-success'>
                    <tr>
                        <th className={`${styles.table_th}`}>Họ tên</th>
                        <th className={`${styles.table_th}`}>Email</th>
                        <th className={`${styles.table_th}`}>Ngày ứng tuyển</th>
                        <th className={`${styles.table_th}`}>Vị trí</th>
                        <th className={`${styles.table_th}`}>CV</th>
                        <th className={`${styles.table_th}`}>Trạng thái</th>
                        <th className={`${styles.table_th}`}>Lý do từ chối</th>
                        <th className={`${styles.table_th}`}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {applications.map((app) => (
                        <tr className={styles.rowHover} key={app.id}>
                            <td className={`${styles.table_td}`}>{app.fullName}</td>
                            <td className={`${styles.table_td}`}>{app.email}</td>
                            <td className={`${styles.table_td}`}>{new Date(app.appliedAt).toLocaleDateString()}</td>
                            <td className={`${styles.table_td}`}>{app.jobTitle}</td>
                            <td className={`${styles.table_td}`}>{app.cvUrl ? <a href={app.cvUrl} target="_blank">Xem CV</a> : 'Không có'}</td>
                            <td className={`${styles.table_td}`}>{app.status}</td>
                            {
                                app.status === "2" ? <td dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(
                                        app.rejectReason
                                    ),
                                }}></td> : <td>-</td>
                            }
                            <td className={`${styles.table_td}`}>
                                {app.status === '0' && (
                                    <div className='d-flex flex-column' >
                                        <button className={`btn btn-sm btn-outline-success ${styles.btn_outline_success}`} onClick={() => handleOpenInterview(app)}>Mời phỏng vấn</button>
                                        <button className={`btn btn-sm btn-outline-danger ${styles.btn_outline_danger}`} onClick={() => handleOpenReject(app)}>Từ chối</button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal mời phỏng vấn */}
            {showInterviewModal && (
                <div className='modal show d-block' tabIndex='-1'>
                    <div className='modal-dialog'>
                        <div className={`modal-content ${styles.modal_content}`}>
                            <div className={`modal-header ${styles.modal_header}`}>
                                <h5 className='modal-title'>Mời phỏng vấn</h5>
                                <button type='button' className='btn-close' onClick={() => setShowInterviewModal(false)}></button>
                            </div>
                            <div className='modal-body'>
                                <label className='fw-semibold'>Nội dung thư mời:</label>
                                <RichTextEditor value={interviewMessage} onChange={setInterviewMessage} />
                            </div>
                            <div className='modal-footer'>
                                <button className='btn btn-secondary' onClick={() => setShowInterviewModal(false)}>Hủy</button>
                                <button className={`btn btn-success ${styles.modal_footer_btn_success}`} onClick={handleScheduleInterview}>Gửi lời mời</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showRejectModal && (
                <div className='modal show d-block' tabIndex='-1'>
                    <div className='modal-dialog'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h5 className='modal-title'>Từ chối ứng viên</h5>
                                <button type='button' className='btn-close' onClick={() => setShowRejectModal(false)}></button>
                            </div>
                            <div className='modal-body'>
                                <label className='fw-semibold'>Lý do từ chối:</label>
                                <RichTextEditor value={rejectReason} onChange={setRejectReason} />
                            </div>
                            <div className='modal-footer'>
                                <button className='btn btn-secondary' onClick={() => setShowRejectModal(false)}>Hủy</button>
                                <button className='btn btn-danger' onClick={handleReject}>Xác nhận từ chối</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicantManagement;
