import DOMPurify from 'dompurify';
import styles from './JobDetailTooltip.module.css';

const JobDetailTooltip = ({ jobDetail }) => {
    if (!jobDetail) return null;

    const sanitizeHTML = (html) => {
        return { __html: DOMPurify.sanitize(html) };
    };

    return (
        <div className={styles['quickview-job-tooltip']}>
            <div className={styles['box-header']}>
                <div className={styles['company-logo']}>
                    <img className={styles['company-logo__img']} src={jobDetail.avatar} alt="Company Logo" />
                </div>
                <div className={styles['job-title-block']}>
                    <h5 className={styles['title']}>{jobDetail.i.title}</h5>
                    <a href="#" className={styles['company-name']}>
                        {jobDetail.companyName}
                    </a>
                    <p className={styles['salary']}>{jobDetail.i.salaryRange}</p>
                </div>
                
            </div>
            <div className={styles['block-info']}>
                <div className={styles['d-flex']}>
                    <p className={styles['location']}>
                        <i className={styles['location__icon'] + ' bi bi-geo-alt'} ></i>
                        {jobDetail.i.location}
                    </p>
                    <p className={styles['deadline']}>
                        <i className= {styles['deadline__icon'] + ' bi bi-clock'}></i>
                        {jobDetail.i.applyDeadline}
                    </p>
                </div>
                
            </div>
            <div className={styles['content-tab']}>
                <div>
                    <h5 className={styles['job-detail-tooltip__h5']}>Mô tả công việc:</h5>
                    <div
                        dangerouslySetInnerHTML={sanitizeHTML(jobDetail.i.jobDescription)}
                    />
                </div>
                <div>
                    <h5 className={styles['job-detail-tooltip__h5']}>Yêu cầu công việc:</h5>
                    <div
                        dangerouslySetInnerHTML={sanitizeHTML(jobDetail.i.requirements)}
                    />
                </div>
                <div>
                    <h5 className={styles['job-detail-tooltip__h5']}>Quyền lợi:</h5>
                    <div
                        dangerouslySetInnerHTML={sanitizeHTML(jobDetail.i.interest)}
                    />
                </div>
            </div>

            <div className={styles['box-footer']}>
                <button className={`${styles['btn']} ${styles['btn-apply-now']}`}>Ứng tuyển ngay</button>
                <button className={`${styles['btn']} ${styles['btn-view-detail']}`}>Xem chi tiết</button>
            </div>
        </div>
    );
};

export default JobDetailTooltip;
