// ✅ InterviewManagement.jsx (chuẩn module scoped và đẹp)
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import styles from './InterviewManagement.module.css';

const InterviewManagement = () => {
    const [interviews, setInterviews] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterJob, setFilterJob] = useState('all');
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        fetchInterviews();
        fetchJobs();
    }, []);

    const fetchInterviews = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/interview/employer/all`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
            });
            setInterviews(res.data);
        } catch (err) {
            toast.error('Không thể tải danh sách phỏng vấn.');
            console.error('Lỗi khi tải :', err);
        }
    };

    const fetchJobs = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/interview/employer/active`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
            });
            setJobs(res.data);
        } catch (err) {
            console.error('Lỗi khi tải jobs:', err);
        }
    };

    const handleExportExcel = () => {
        const exportData = filteredInterviews.map(i => ({
            'Ứng viên': i.candidateName,
            'Email': i.email,
            'Công việc': i.jobTitle,
            'Trạng thái': i.status,
            'Ngày tạo': new Date(i.createdAt).toLocaleString(),
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Phỏng vấn');
        XLSX.writeFile(wb, 'lich-phong-van.xlsx');
    };

    const filteredInterviews = interviews.filter(i => {
        const matchStatus = filterStatus === 'all' || i.status === filterStatus;
        const matchJob = filterJob === 'all' || i.jobTitle === filterJob;
        return matchStatus && matchJob;
    });

    return (
        <div className={`container ${styles.wrapper}`}>
            <div className='d-flex justify-content-between align-items-center mb-3'>
                <h3 className={styles.title}>Lịch phỏng vấn</h3>
                <button className={`btn btn-outline-success ${styles.exportBtn}`} onClick={handleExportExcel}>Xuất Excel</button>
            </div>

            <div className='row mb-3'>
                <div className='col-md-4'>
                    <label className='fw-semibold'>Trạng thái:</label>
                    <select className={`form-select ${styles.selectBox}`} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value='all'>Tất cả</option>
                        <option value='pending'>Chờ xác nhận</option>
                        <option value='accepted'>Đã xác nhận</option>
                        <option value='declined'>Từ chối</option>
                    </select>
                </div>
                <div className='col-md-4'>
                    <label className='fw-semibold'>Bài tuyển:</label>
                    <select className={`form-select ${styles.selectBox}`} value={filterJob} onChange={(e) => setFilterJob(e.target.value)}>
                        <option value='all'>Tất cả</option>
                        {jobs.map(j => (
                            <option key={j.id} value={j.title}>{j.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            <table className='table table-bordered table-hover'>
                <thead>
                    <tr>
                        <th className={styles.tableHeader}>Ứng viên</th>
                        <th className={styles.tableHeader}>Email</th>
                        <th className={styles.tableHeader}>Công việc</th>
                        <th className={styles.tableHeader}>Ngày tạo</th>
                        <th className={styles.tableHeader}>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredInterviews.map(interview => (
                        <tr key={interview.id}>
                            <td className={styles.cell}>{interview.candidateName}</td>
                            <td className={styles.cell}>{interview.email}</td>
                            <td className={styles.cell}>{interview.jobTitle}</td>
                            <td className={styles.cell}>{new Date(interview.createdAt).toLocaleString()}</td>
                            <td className={styles.cell}>
                                <span className={`badge ${styles.badgeStatus} bg-${interview.status === 'pending' ? 'warning' : interview.status === 'accepted' ? 'success' : 'danger'
                                    }`}>
                                    {interview.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InterviewManagement;