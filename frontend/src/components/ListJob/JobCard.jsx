import { useState } from 'react';
import Tippy from '@tippyjs/react';
import JobDetailTooltip from '../JobDetailTooltip/JobDetailTooltip.jsx';
import logo from '../../assets/images/topcv-logo-10-year.png';
import gap from '../../assets/images/icon-flash.webp';
import styles from './Jobs.module.css';
import { Link } from 'react-router-dom'
import { FaRegHeart } from "react-icons/fa6";
import { toast } from 'react-toastify';
import { saveJob } from '@/api/saveJobApi';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';


const JobCard = ({ job, fetchJobDetail, JobDetailCache, index }) => {
    // eslint-disable-next-line no-unused-vars
    const [visible, setVisible] = useState(false);

    const handleTooltipVisibleChange = async (visible) => {
        if (visible && !JobDetailCache[job.id]) {
            await fetchJobDetail(job.id);
        }
        setVisible(visible);
    };
    const handleSaveJob = async () => {
        try {
            await saveJob(job.id); // không cần token, cookie tự gửi
            toast.success('Đã lưu tin tuyển dụng!');
        } catch (error) {
            if (error.response?.status === 400) {
                toast.info('Bạn đã lưu tin này rồi.');
            }
            else if (error.response?.status === 401) {
                toast.warning('Vui lòng đăng nhập');
            }
            else {
                toast.error('Lỗi khi lưu tin.');
            }
        }
    };


    const placement = (index + 1) % 3 === 1 ? 'right' : 'left';

    return (
        <div className='col-12 col-md-6 col-lg-4 mb-3'>
            <div className={`card ${styles.card}`}>
                <div className={` d-flex flex-column gap-2 ${styles.jobCard}`}>
                    <div className='d-flex gap-3'>
                        <div className={styles.outerBorder} style={{ position: 'relative', display: 'inline-block' }}>
                            {job.highlightType === 'gap' && (
                                <img
                                    src={gap}
                                    alt="Gap Icon"
                                    style={{
                                        position: 'absolute',
                                        top: '-15px',
                                        left: '-5px',
                                        width: '20px',

                                        zIndex: 2
                                    }}
                                />
                            )}
                            <div className={
                                job.highlightType === 'gap'
                                    ? styles.companyLogoTopMax
                                    : job.highlightType === 'hot'
                                        ? styles.companyLogoTopVip
                                        : styles.companyLogo
                            }>
                                <img
                                    src={job.avatar || logo}
                                    alt="Company Logo"
                                    className={styles.companyLogoImage}
                                />
                            </div>
                        </div>

                        <div className='flex-grow-1 overflow-hidden'>
                            <Tippy
                                delay={[200, 0]}
                                theme='light'
                                arrow
                                offset={placement === 'left' ? [0, 250] : [0, 0]}
                                interactive
                                placement={placement}
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
                                <Link
                                    to={`/jobposts/${job.id}`}
                                    className={`${styles.jobTitle} ${job.highlightType === 'gap' ? styles.jobTitleUrgent : ''}`}
                                >
                                    {job.jobTitle}
                                </Link>

                            </Tippy>
                            <p
                                className={`mb-1 ${job.employerIsPro ? styles.companyNamePro : styles.companyName}`}
                            >
                                {job.employerIsPro && (
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip id={`tooltip-pro-${job.id}`} style={{
                                            fontSize: '10px'
                                        }} >Nhà tuyển dụng là Pro Company</Tooltip>}
                                    >
                                        <span className={styles.proBadge}>Pro</span>
                                    </OverlayTrigger>
                                )}<Link
                                    to={`/company/${job.slug}`}
                                    style={{
                                        textDecoration: 'none',
                                        color: '#333',
                                    }}  
                                >
                                    {job.company}
                                </Link>
                            </p>
                        </div>
                    </div>

                    <div className='d-flex justify-content-between align-items-center'>
                        <div className='d-flex flex-wrap gap-2'>
                            <span className={styles.jobSalary}>{job.salary}</span>
                            <span className={styles.jobLocation}>{job.location}</span>
                        </div>
                        <button
                            className='d-flex justify-content-center align-items-center'
                            style={{
                                color: '#00b14f',
                                border: '1px solid #00b14f',
                                borderRadius: '50%',
                                height: '28px',
                                width: '28px',
                                background: 'white',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#e9f9f1')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                            onClick={handleSaveJob}
                        >
                            <FaRegHeart />
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default JobCard;
