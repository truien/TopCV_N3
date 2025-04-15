import { useState } from 'react';
import styles from './RelatedJobs.module.css';
import { CiHeart } from 'react-icons/ci';
import { TbCoinFilled } from 'react-icons/tb';
import Tippy from '@tippyjs/react';
import JobDetailTooltip from '../JobDetailTooltip/JobDetailTooltip';
import logo from '../../assets/images/avatar-default.jpg'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
function RelatedJobs({ job, fetchJobDetail, JobDetailCache }) {
    // eslint-disable-next-line no-unused-vars
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();
    if (!job) {
        return null;
    }


    const handleTooltipVisibleChange = async (visible) => {
        if (visible && !JobDetailCache[job.id]) {
            await fetchJobDetail(job.id);
        }
        setVisible(visible);
    };
    const calculateDaysLeft = (deadline) => {
        const today = new Date(); // Ngày hiện tại
        const deadlineDate = new Date(deadline); // Chuyển đổi deadline thành kiểu Date
        const timeDiff = deadlineDate - today; // Tính khoảng cách thời gian (milliseconds)
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Chuyển đổi sang số ngày

        if (daysDiff > 0) {
            return { type: 'remaining', days: daysDiff }; // Còn ngày
        } else {
            return { type: 'overdue', days: Math.abs(daysDiff) }; // Quá hạn
        }
    };
    const daysInfo = calculateDaysLeft(job.applyDeadline);
    const dayUpdate = Math.round(
        (-new Date(job.postDate).getTime() + new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const handleSaveJob = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.warning('Vui lòng đăng nhập để lưu tin!');
                navigate("/")
                return;
            }
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/SaveJob/save-job/${job.id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success('Đã lưu tin tuyển dụng!');
        } catch (error) {
            if (error.response?.status === 400) {
                toast.info('Bạn đã lưu tin này rồi.');
            } else {
                toast.error('Lỗi khi lưu tin.');
            }
        }
    };

    return (
        <>
            <Tippy
                delay={[200, 0]}
                theme='light'
                arrow
                interactive
                placement={'left'}
                className='bg-transparent'
                content={
                    JobDetailCache[job.id] ? (
                        <JobDetailTooltip jobDetail={JobDetailCache[job.id]} />
                    ) : (
                        <span>Đang tải...</span>
                    )
                }
                onShow={() => handleTooltipVisibleChange(true)}
                onHide={() => handleTooltipVisibleChange(false)}
            >
                <div
                    className={`d-flex align-items-center position-relative ${styles.jobCard}`}
                >
                    {/* Logo */}
                    <div className={styles.logo}>
                        <img
                            src={job.avatar || logo}
                            alt='Logo'
                            style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: ' 4px',
                                border: '1px solid #ddd',
                            }}
                        />
                    </div>

                    {/* Nội dung */}
                    <div className='ms-3 flex-grow-1'>
                        <h5 className={`mb-2 ${styles.jobTitle}`}>
                            {job.title}
                        </h5>
                        <p
                            className='mb-3 text-muted'
                            style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                lineHeight: '20px',
                                color: '#424e5c',
                            }}
                        >
                            {job.companyName}
                        </p>
                        <div className='d-flex flex-wrap align-items-center mb-2'>
                            <span className='badge bg-light text-dark me-2'>
                                {job.location}
                            </span>
                            <span className='badge bg-light text-dark me-2'>
                                {job.applyDeadline
                                    ? daysInfo.type === 'remaining'
                                        ? `Còn ${daysInfo.days} ngày để ứng tuyển`
                                        : `Đã quá ${daysInfo.days} ngày`
                                    : 'Hạn ứng tuyển chưa được đặt'}
                            </span>
                            <span className='badge bg-light text-dark'>
                                Cập nhật {dayUpdate} ngày trước
                            </span>
                        </div>
                    </div>

                    {/* Mức lương */}
                    <div className=''>
                        <p
                            className={`mb-2 mt-3 me-1 position-absolute top-0 end-0 ${styles.salary}`}
                        >
                            <TbCoinFilled
                                style={{ height: '15px', width: '15px' }}
                            />{' '}
                            {job.salaryRange}
                        </p>
                        <div className='d-flex position-absolute bottom-0 end-0 mb-1 me-1'>
                            <button
                                className='btn btn-success btn-sm me-2'
                                style={{ fontSize: '12px' }}
                            >
                                Ứng tuyển
                            </button>
                            <button className='btn btn-outline-success btn-sm' onClick={handleSaveJob}>
                                <CiHeart />
                            </button>
                        </div>
                    </div>
                </div>
            </Tippy>
        </>
    );
}

export default RelatedJobs;
