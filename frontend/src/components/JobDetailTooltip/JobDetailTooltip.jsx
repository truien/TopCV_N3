import DOMPurify from 'dompurify';
import styles from './JobDetailTooltip.module.css';
import defaultLogo from '../../assets/images/topcv-logo-10-year.png';
import { useNavigate } from 'react-router-dom';
const JobDetailTooltip = ({ jobDetail }) => {
    const navigate = useNavigate();
    if (!jobDetail) return null;
    const sanitizeHTML = (html) => {
        return { __html: DOMPurify.sanitize(html) };
    };
    const formatDate = (dateStr) => {
        if (!dateStr) return 'Không có hạn nộp';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN');
    };

    const handleApply = (id) => {
        navigate(`/jobposts/${id}`)
    }

    return (
        <div className={styles['quickview-job-tooltip']}>
            <div className={styles['box-header']}>
                <div className={styles['company-logo']}>
                    <img
                        className={styles['company-logo__img']}
                        src={jobDetail.avatar || defaultLogo}
                        alt="Company Logo"
                    />
                </div>
                <div className={styles['job-title-block']}>
                    <h5 className={styles['title']}>{jobDetail.title}</h5>
                    <a href="#" className={styles['company-name']}>
                        {jobDetail.companyName}
                    </a>
                    <p className={styles['salary']}>{jobDetail.salaryRange}</p>
                </div>
            </div>

            <div className={styles['block-info']}>
                <div className={styles['d-flex']}>
                    <p className={styles['location']}>
                        <i className={`${styles['location__icon']} bi bi-geo-alt`} />
                        {jobDetail.location}
                    </p>
                    <p className={styles['deadline']}>
                        <i className={`${styles['deadline__icon']} bi bi-clock`} />
                        {formatDate(jobDetail.applyDeadline)}
                    </p>
                </div>
            </div>

            <div className={styles['content-tab']}>
                <div>
                    <h5 className={styles['job-detail-tooltip__h5']}>Mô tả công việc:</h5>
                    <div dangerouslySetInnerHTML={sanitizeHTML(jobDetail.jobDescription)} />
                </div>
                <div>
                    <h5 className={styles['job-detail-tooltip__h5']}>Yêu cầu công việc:</h5>
                    <div dangerouslySetInnerHTML={sanitizeHTML(jobDetail.requirements)} />
                </div>
                <div>
                    <h5 className={styles['job-detail-tooltip__h5']}>Quyền lợi:</h5>
                    <div dangerouslySetInnerHTML={sanitizeHTML(jobDetail.interest)} />
                </div>
            </div>

            <div className={`${styles['box-footer']} row`}>
                <button onClick={() => { handleApply(jobDetail.id) }} className={`${styles['btn']} ${styles['btn-apply-now']} col-3 me-4 ms-2`}>Ứng tuyển</button>
                <button className={`${styles['btn']} ${styles['btn-view-detail']} col-8`}>Xem chi tiết</button>
            </div>
        </div>
    );
};

export default JobDetailTooltip;
