import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer'
import {
    FaChevronRight,
    FaAngleDown,
    FaAngleUp,
    FaLocationDot,
    FaMap,
    FaRegCopy,
    FaFacebookF,
    FaLinkedin,
} from 'react-icons/fa6';
import { FaTwitter } from 'react-icons/fa';
import styles from './CompanyInfor.module.css';
import coverPhoto from '../../../assets/images/company_cover.jpg';
import { TbBuildings } from 'react-icons/tb';
import { useState, useEffect } from 'react';
import RelatedJobs from '../../../components/RelatedJobs/RelatedJobs';
import DOMPurify from 'dompurify';
import { getCompanyBySlug } from '@/api/companyApi';
import { getCompanyJobs, getJobDetail } from '@/api/jobApi';
import {
    isFollowingEmployer,
    followEmployer,
    unfollowEmployer,
    getFollowersCount
} from '@/api/followApi';
import { useParams } from 'react-router-dom';

const CompanyInfor = () => {
    const copyLink = window.location.href;
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const { slug } = useParams();

    const JobDetailCache = {};
    useEffect(() => {
        if (!slug) return;

        getCompanyBySlug(slug)
            .then(data => {
                setCompany(data);
                return data.userId;
            })
            .then(companyId => {
                getCompanyJobs(companyId).then(setJobs);
                isFollowingEmployer(companyId).then(setIsFollowing);
                getFollowersCount(companyId).then(res => setFollowersCount(res.count));
            })
            .catch(console.error);
    }, [slug]);


    const handleFollowToggle = () => {
        if (!company) return;
        const action = isFollowing ? unfollowEmployer : followEmployer;
        action(company.id)
            .then(() => {
                setIsFollowing(prev => !prev);
                setFollowersCount(prev => prev + (isFollowing ? -1 : 1));
            })
            .catch(console.error);
    };

    const prefetchJobDetail = async (id) => {
        if (!JobDetailCache[id]) {
            try {
                const jobDetail = await getJobDetail(id);
                JobDetailCache[id] = jobDetail;
            } catch (error) {
                console.error('Error fetching job detail:', error);
            }
        }
    };
    if (!company) {
        return <div>Đang tải …</div>;
    }

    const ReadMore = ({ children }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const toggleReadMore = () => {
            setIsExpanded(!isExpanded);
        };
        return (
            <div
                style={{
                    padding: '12px 16px',
                }}
            >
                <div
                    style={{
                        maxHeight: isExpanded ? 'none' : '200px',
                        overflow: 'hidden',
                        transition: 'max-height 0.5s ease',
                    }}
                >
                    {children}
                </div>
                <a
                    onClick={toggleReadMore}
                    style={{
                        marginTop: '1px',
                        color: '#00b14f',
                        cursor: 'pointer',
                        fontSize: '14px',
                    }}
                >
                    {isExpanded ? (
                        <>
                            Thu gọn <FaAngleUp />{' '}
                        </>
                    ) : (
                        <>
                            Xem thêm <FaAngleDown />
                        </>
                    )}
                </a>
            </div>
        );
    };
    return (
        <>
            <Header />
            <div style={{ backgroundColor: '#F3F5F7' }} className='mb-5'>
                <div className='container py-2 '>
                    <ul className={styles['text'] + ' nav d-flex'}>
                        <li className='nav-item'>
                            <a
                                className={
                                    styles['text'] + ' text-highlight bold'
                                }
                            >
                                Danh sách Công ty <FaChevronRight />
                            </a>
                        </li>
                        <li className='nav-item'>
                            Thông tin công ty và tin tuyển dụng từ{' '}
                            {company.companyName}
                        </li>
                    </ul>
                </div>
                <div className='container py-2'>
                    <section
                        className={
                            styles['bg_company'] +
                            '  company_info position-relative rounded'
                        }
                    >
                        <div className='coverphoto '>
                            <img
                                src={coverPhoto}
                                alt='Logo'
                                className=' w-100 '
                            />
                        </div>
                        <div
                            className={
                                styles['top'] +
                                ' logo position-absolute start-0 ms-5 '
                            }
                        >
                            <img
                                src={company.avatar}
                                alt='Logo'
                                className={styles['logo'] + ' rounded-circle'}
                            />
                        </div>
                        <div className='d-flex p-5 ms-5 justify-content-between '>
                            <div
                                className={
                                    styles['ps_6'] +
                                    ' copany_name text-light ms-5 d-block'
                                }
                            >
                                <span className='fs-4'>
                                    {company.companyName}
                                </span>
                                <div className='d-flex align-content-center'>
                                    <TbBuildings
                                        style={{
                                            fontSize: '20px',
                                        }}
                                        className='me-2'
                                    />
                                    {followersCount} followers
                                </div>
                            </div>
                            <div className='folow'>
                                <button
                                    className={`btn btn-${isFollowing ? 'secondary' : 'success'}`}
                                    onClick={handleFollowToggle}
                                >
                                    {isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
                <div className='container mt-5'>
                    <div className=' row'>
                        <div className=' col-8'>
                            <div
                                className='copany_infor mt-3'
                                style={{
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    background: '#fff',
                                }}
                            >
                                <h2 className={styles['title']}>
                                    Giới thiệu công ty
                                </h2>
                                <ReadMore>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: DOMPurify.sanitize(
                                                company.description
                                            ),
                                        }}
                                    ></div>
                                </ReadMore>
                            </div>
                            <div
                                className='copany_job mt-5'
                                style={{
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    background: '#fff',
                                }}
                            >
                                <h2 className={styles['title']}>Tuyển dụng</h2>
                                <section
                                    className={
                                        styles['boder_custum'] +
                                        ' section mt-3 p-3'
                                    }
                                >
                                    {jobs ? (
                                        jobs.map((job) => (
                                            <RelatedJobs
                                                key={job.id}
                                                job={job}
                                                fetchJobDetail={
                                                    prefetchJobDetail
                                                }
                                                JobDetailCache={JobDetailCache}
                                            />
                                        ))
                                    ) : (
                                        <div>Chưa có việc làm</div>
                                    )}
                                </section>
                            </div>
                        </div>
                        <div className='col-4'>
                            <div
                                className='section-contact mt-3'
                                style={{
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    background: '#fff',
                                }}
                            >
                                <h2 className={styles['title']}>
                                    Thông tin liên hệ
                                </h2>
                                <div className='pt-4 d-flex flex-row '>
                                    <FaLocationDot
                                        className={
                                            styles['icon'] + ' mx-2 fs-6'
                                        }
                                    />
                                    <p className={styles['text_c4']}>
                                        Địa chỉ công ty
                                    </p>
                                </div>
                                <div
                                    style={{
                                        color: '#4d5965',
                                        fontSize: '14px',
                                        fontWeight: '400',
                                    }}
                                    className='px-2'
                                >
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: DOMPurify.sanitize(
                                                company.location
                                            ),
                                        }}
                                    ></div>
                                    <hr />
                                </div>
                                <div className='pt-1 d-flex flex-row align-items-center'>
                                    <div>
                                        <FaMap
                                            className={
                                                styles['icon'] + ' mx-2 fs-3'
                                            }
                                        />
                                    </div>
                                    <p className={styles['text_c4'] + ' pt-3'}>
                                        Xem bản đồ
                                    </p>
                                </div>
                                <iframe
                                    src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.781862728181!2d105.78755502438749!3d21.041412487345465!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab3f291639d3%3A0x2c0f30e8a9790b85!2zQ8O0bmcgVHkgQ1AgxJDhuqd1IFTGsCBUaMawxqFuZyBN4bqhaSAmIFBow6F0IFRyaeG7g24gQ8O0bmcgTmdo4buHIEZTSQ!5e0!3m2!1svi!2s!4v1736723372182!5m2!1svi!2s'
                                    height='350'
                                    width='355'
                                    className='p-2'
                                    style={{ border: '0' }}
                                    allowFullScreen=''
                                    loading='lazy'
                                    referrerPolicy='no-referrer-when-downgrade'
                                />
                            </div>
                            <div
                                className='my-3'
                                style={{
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    background: '#fff',
                                }}
                            >
                                <h2 className={styles['title']}>
                                    Chia sẻ công ty tới bạn bè
                                </h2>
                                <div>
                                    <p
                                        className={
                                            styles['text_c4'] + ' pt-3 px-2'
                                        }
                                    >
                                        Sao chép đường dẫn
                                    </p>
                                    <div
                                        className={styles['box-copy'] + ' m-3'}
                                    >
                                        <input
                                            readOnly
                                            type='text'
                                            defaultValue={copyLink}
                                            className={styles['input_copy']}
                                        ></input>
                                        <div className='btn-copy'>
                                            <button
                                                className={
                                                    styles['btn-copy-url']
                                                }
                                            >
                                                <FaRegCopy />
                                            </button>
                                        </div>
                                    </div>
                                    <div
                                        className={
                                            styles['text_c4'] + ' pt-3 px-2'
                                        }
                                    >
                                        Chia sẻ qua mạng xã hội
                                        <div className='d-flex mt-3'>
                                            <div
                                                className={
                                                    styles['box-share'] +
                                                    ' me-3'
                                                }
                                            >
                                                <FaFacebookF
                                                    style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        color: '#327FFF',
                                                    }}
                                                />
                                            </div>
                                            <div
                                                className={
                                                    styles['box-share'] +
                                                    ' me-3'
                                                }
                                            >
                                                <FaTwitter
                                                    style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        color: '#34CBFF',
                                                    }}
                                                />
                                            </div>
                                            <div
                                                className={styles['box-share']}
                                            >
                                                <FaLinkedin
                                                    style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        color: '#02639D',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default CompanyInfor;
