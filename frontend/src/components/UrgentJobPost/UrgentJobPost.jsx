import { useEffect, useState } from 'react';
import { getUrgentJobs } from '@/api/jobApi';
import styles from './UrgentJobPost.module.css';
import gap from '../../assets/images/icon-flash.webp';
import { Tooltip } from 'bootstrap';


export default function UrgentJobPost() {
    const [jobs, setJobs] = useState([]);
    const [displayJobs, setDisplayJobs] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(4 * 60 * 60 + 4 * 60);

    useEffect(() => {
        async function fetchJobs() {
            const res = await getUrgentJobs();
            setJobs(res);
            setDisplayJobs(res.slice(0, 4));
        }
        fetchJobs();
    }, []);

    useEffect(() => {
        if (jobs.length <= 4) return;

        const interval = setInterval(() => {
            setDisplayJobs(prev => {
                const newJobs = [...prev];
                const nextIndex = (currentIndex + 4) % jobs.length;
                newJobs.shift();
                newJobs.push(jobs[nextIndex]);
                setCurrentIndex((nextIndex + 1) % jobs.length);
                return newJobs;
            });
        }, 30000);

        return () => clearInterval(interval);
    }, [jobs, currentIndex]);
    useEffect(() => {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipTriggerList.forEach(tooltipTriggerEl => {
            new Tooltip(tooltipTriggerEl);
        });
    }, [displayJobs]);

    useEffect(() => {
        const countdown = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    getUrgentJobs().then(res => {
                        setJobs(res);
                        setDisplayJobs(res.slice(0, 4));
                        setTimeLeft(4 * 60 * 60 + 4 * 60);
                    });
                    return 4 * 60 * 60 + 4 * 60;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdown);
    }, []);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return {
            hrs: String(hrs).padStart(2, '0'),
            mins: String(mins).padStart(2, '0'),
            secs: String(secs).padStart(2, '0')
        };
    };

    const { hrs, mins, secs } = formatTime(timeLeft);

    return (
        <div className={`${styles.wrapper}` + ' row'}
        >
            <div className={`${styles.left}` + ' col-5'} >
                <h2 className={styles.title}>Huy Hiệu Tia Sét</h2>
                <p className={styles.subTitle}>Ghi nhận sự tương tác thường xuyên của Nhà tuyển dụng với CV ứng viên</p>
                <div className={styles.count}>
                    <span className={styles.count_span}>{jobs.length.toLocaleString()}</span> tin đăng được NTD tương tác trong 24 giờ qua
                </div>
                <div className={styles.timer}>
                    <div className={styles.timeBox}>{hrs}</div>:
                    <div className={styles.timeBox}>{mins}</div>:
                    <div className={styles.timeBox}>{secs}</div>
                </div>
                <p className={styles.reloadText}>Tự động cập nhật sau</p>
            </div>
            <div className={`${styles.right}` + ' col-3'} >
                <div className={styles.jobList}>
                    {displayJobs.map(job => (
                        <div key={job.id} className={styles.jobCard}>
                            <div className={styles.logo}>
                                <img src={job.avatar} className={styles.companylogo} style={{
                                    width: '46px',
                                    height: '46px'
                                }} />
                                <div className={styles.logoFlag}>
                                    <img src={gap} alt="" style={{
                                        width: '21px',
                                        height: '29px'
                                    }} />
                                </div>
                            </div>
                            <div className={styles.jobInfo}>
                                <div
                                    className={styles.jobTitle}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    data-bs-custom-class="custom-tooltip"
                                    data-bs-title={`${job.title} - ${job.salaryRange || 'Đang cập nhật'} - ${job.location || 'Đang cập nhật'}`}
                                >
                                    {job.title}
                                </div>
                                <div className={styles.companyName}>{job.companyName}</div>
                                <div className={styles.location}>{job.location}</div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
            <div className='col-4'>
                <div className='d-flex flex-column position-relative'>
                    <div className='position-relative' style={{ height: '290px' }}>
                        <img src="https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/v4/image/welcome/box-flash-badge/flash-badge-intro.png"
                            alt="Flash badge"
                            className={styles.bigBadge} />
                    </div>
                    <div className='mt-3 align-self-center'>
                        <div className={styles.listTitle}>
                            Danh sách tin đăng đạt <br />
                            Huy hiệu Tia sét
                        </div>
                        <div className={`${styles.viewButton} btn`}>
                            Xem Ngay →
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
