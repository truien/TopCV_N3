
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import RichTextEditor from '../../../components/RichTextEditor/RichTextEditor';
import styles from './ApplicantManagement.module.css';
import DOMPurify from 'dompurify';
import { getApplicationsForEmployer, rejectApplication } from '@/api/applicationApi';
import { scheduleInterview } from '@/api/interviewApi';


const ApplicantManagement = () => {
    const [applications, setApplications] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [interviewMessage, setInterviewMessage] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [selectedApps, setSelectedApps] = useState([]);
    const visibleApps = applications.filter(app => app.status === "0");

    const fetchApplications = async () => {
        try {
            const data = await getApplicationsForEmployer();
            setApplications(data);
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
            const ids = selectedApps.length > 0
                ? selectedApps
                : [selectedApp.id];

            // chỉ giữ những ID thực sự còn hiển thị (status === "0")
            const idsToProcess = ids.filter(id =>
                visibleApps.some(app => app.id === id)
            );

            await Promise.all(idsToProcess.map(id => {
                const app = applications.find(a => a.id === id);
                return scheduleInterview({
                    jobId: app.jobId,
                    candidateUserId: app.userId,
                    message: interviewMessage,
                });
            }));

            toast.success("Đã mời phỏng vấn.");
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
                visibleApps.some(app => app.id === id)
            );

            await Promise.all(idsToReject.map(id =>
                rejectApplication(id, rejectReason)
            ));

            toast.success("Đã từ chối ứng viên.");
            setShowRejectModal(false);
            setSelectedApps([]);
            fetchApplications();
        } catch (err) {
            toast.error("Lỗi khi từ chối ứng viên.");
            console.error(err);
        }
    };


    return (
        <div className={`container ${styles.wrapper}`}>
            <h3 className={`mb-4 text-success ${styles.h3_title}`}>Quản lý hồ sơ ứng viên</h3>
            <div className="mb-3">
                <button
                    className="btn btn-success me-2"
                    disabled={selectedApps.length === 0}
                    onClick={() => {
                        setSelectedApp(null);
                        setInterviewMessage('');
                        setShowInterviewModal(true);
                    }}
                >
                    Mời phỏng vấn hàng loạt
                </button>
                <button
                    className="btn btn-danger"
                    disabled={selectedApps.length === 0}
                    onClick={() => {
                        setSelectedApp(null);
                        setRejectReason('');
                        setShowRejectModal(true);
                    }}
                >
                    Từ chối hàng loạt
                </button>
            </div>
            <table className='table table-hover'>
                <thead className='table-success'>
                    <tr>
                        <th>
                            <input
                                type='checkbox'
                                onChange={e => setSelectedApps(
                                    e.target.checked
                                        ? visibleApps.map(a => a.id)
                                        : []
                                )}
                                checked={
                                    visibleApps.length > 0 &&
                                    selectedApps.length === visibleApps.length
                                }
                            />
                        </th>
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
                    {visibleApps.map((app) => (
                        <tr className={styles.rowHover} key={app.id}>
                            <td>
                                <input
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
                            </td>
                            <td className={`${styles.table_td}`}>{app.fullName}</td>
                            <td className={`${styles.table_td}`}>{app.email}</td>
                            <td className={`${styles.table_td}`}>{new Date(app.appliedAt).toLocaleDateString()}</td>
                            <td className={`${styles.table_td}`}>{app.jobTitle}</td>
                            <td className={`${styles.table_td}`}>{app.cvUrl ? <a href={app.cvUrl} target="_blank">Xem CV</a> : 'Không có'}</td>
                            <td className={`${styles.table_td}`}>{app.status == 0 ? "pending" : "applited"}</td>
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
