import logofooter from '../../assets/images/topcv-logo-footer-6.webp';
import googleStart from '../../assets/images/google_for_startup.webp';
import DMCA from '../../assets/images/DMCA_badge.png';
import BCT from '../../assets/images/bct.webp';
import styles from './Footer.module.css';
import {
    FaFacebook,
    FaYoutube,
    FaLinkedin,
    FaTiktok,
    FaCalculator,
    FaFile,
    FaLocationDot,
} from 'react-icons/fa6';

function Footer() {
    return (
        <>
            <div className='footer-main my-4'>
                <div className='container'>
                    <div className='box-main row'>
                        <div className='col-5'>
                            <div className='box-logo'>
                                <img
                                    className={styles['logo']}
                                    src={logofooter}
                                    alt='logofooter'
                                />
                            </div>
                            <div
                                className={
                                    styles['logoflex'] +
                                    ' box-image-flex align-items-center d-flex justify-content-around'
                                }
                            >
                                <div className='box-image-item '>
                                    <img
                                        src={googleStart}
                                        alt=''
                                        className='w-100'
                                    />
                                </div>
                                <div className='box-image-item ms-2'>
                                    <img src={DMCA} alt='' className='w-75' />
                                </div>
                                <div className='box-image-item '>
                                    <img src={BCT} alt='' className='w-50' />
                                </div>
                            </div>
                            <div className='box-contact mt-3'>
                                <p className='title'>Liên hệ</p>
                                <span className='fw-lighter'>Hotline:</span>
                                <a
                                    className=' text-reset'
                                    href='tel:0988808999'
                                >
                                    {' '}
                                    098 8808 999 (Giờ hành chính)
                                </a>{' '}
                                <br />
                                <span className='fw-lighter'>Email: </span>
                                <a
                                    href='mailto:trongtruyen04@gmail.com'
                                    className=' text-reset'
                                >
                                    trongtruyen04@gmail.com
                                </a>
                            </div>
                            <div className='box-dowload mt-3'>
                                <p>Ứng dụng tải xuống</p>
                                <div className='dowload-img d-flex'>
                                    <div className='androi'>
                                        <img
                                            src='https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/v4/image/welcome/download/chplay.png'
                                            alt=''
                                        />
                                    </div>
                                    <div className='ios'>
                                        <img
                                            src='https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/v4/image/welcome/download/app_store.png'
                                            alt=''
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='box-social mt-3'>
                                <p>Cộng đồng TopCV</p>
                                <div className='social-icon d-flex'>
                                    <div className='me-3'>
                                        <FaFacebook
                                            className={styles['icon']}
                                        />
                                    </div>
                                    <div className='me-3'>
                                        <FaYoutube className={styles['icon']} />
                                    </div>
                                    <div className='me-3'>
                                        <FaLinkedin
                                            className={styles['icon']}
                                        />
                                    </div>
                                    <div>
                                        <FaTiktok className={styles['icon']} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='col-2'>
                            <div className='box-menu-item'>
                                <div className='title fw-bolder fs-6'>
                                    Về TOPCV
                                </div>
                                <div className='box-menu-child row row-cols-1'>
                                    <a
                                        className={styles['item'] + ' my-3 col'}
                                        href='#'
                                    >
                                        Giới thiệu
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Góc báo chí
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Tuyển dụng
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Liên hệ
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Hỏi đáp
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Chính sách bảo mật
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Điều Khoản dịch vụ
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Quy chế hoạt động
                                    </a>
                                </div>
                            </div>
                            <div className='box-menu-item'>
                                <div className='title fw-bolder fs-6'>
                                    Đối tác
                                </div>
                                <div className='box-menu-child row row-cols-1'>
                                    <a
                                        className={styles['item'] + ' my-3 col'}
                                        href='#'
                                    >
                                        TestCenter
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        TopHR
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        ViecNgay
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Liên hệ
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Happy Time
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className='col-3'>
                            <div className='box-menu-item'>
                                <div className='title fw-bolder fs-6'>
                                    Hồ sơ và CV
                                </div>
                                <div className='box-menu-child row row-cols-1'>
                                    <a
                                        className={styles['item'] + ' my-3 col'}
                                        href='#'
                                    >
                                        Quản lý CV của bạn
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        TopCV Profile
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Hướng dẫn viết CV
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Thư viện CV theo ngành nghề
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Review CV
                                    </a>
                                </div>
                            </div>
                            <div className='box-menu-item'>
                                <div className='title fw-bolder fs-6'>
                                    Khám phá
                                </div>
                                <div className='box-menu-child row row-cols-1'>
                                    <a
                                        className={styles['item'] + ' my-3 col'}
                                        href='#'
                                    >
                                        Ứng dụng di động TopCV
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Tính lương Gross - Net
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Tính lãi suất kép
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Lập kế hoạch tiết kiệm
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Tính bảo hiểm thất nghiệp
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Tính bảo hiểm xã hội một lần
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Trắc nghiệm MBTI
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Trắc nghiệm MI
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className='col-2'>
                            <div className='box-menu-item'>
                                <div className='title fw-bolder fs-6'>
                                    Xây dựng sự nghiệp
                                </div>
                                <div className='box-menu-child row row-cols-1'>
                                    <a
                                        className={styles['item'] + ' my-3 col'}
                                        href='#'
                                    >
                                        Việc làm tốt nhất
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Việc làm lương cao
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Việc làm quản lý
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Việc làm IT
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Việc làm Senior
                                    </a>
                                    <a
                                        className={styles['item'] + ' mb-3 col'}
                                        href='#'
                                    >
                                        Việc làm bán thời gian
                                    </a>
                                </div>
                            </div>
                            <div className='box-menu-item'>
                                <div className='title fw-bolder fs-6'>
                                    Phát triển bản thân
                                </div>
                                <div className='box-menu-child row row-cols-1'>
                                    <a
                                        className={styles['item'] + ' my-3 col'}
                                        href='#'
                                    >
                                        TopCV Contest
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='footer-info mt-5 border-top'>
                        <div className='row p-3'>
                            <div className='col-10'>
                                <h4
                                    className='company-name fs-4 fw-bold mb-5'
                                    style={{ color: '#000' }}
                                >
                                    Công ty Cổ phần TopCV Việt Nam
                                </h4>
                                <div className='box-tax-code'>
                                    <div className='group-top d-flex justify-content-between align-items-center'>
                                        <div className='item d-flex align-items-center'>
                                            <FaCalculator />
                                            <span>
                                                Giấy phép đăng ký kinh doanh số:{' '}
                                            </span>
                                            <strong>0107307178</strong>
                                        </div>
                                        <div className='item d-flex align-items-center'>
                                            <FaFile />
                                            <span>
                                                Giấy phép hoạt động dịch vụ việc
                                                làm số:{' '}
                                            </span>
                                            <strong>18/SLĐTBXH-GP</strong>
                                        </div>
                                    </div>
                                    <div className='item d-flex align-items-center'>
                                        <FaLocationDot />
                                        <span>Trụ sở HN: </span>
                                        <strong>
                                            Tòa FS - GoldSeason số 47 Nguyễn
                                            Tuân, P.Thanh Xuân Trung, Q.Thanh
                                            Xuân, Hà Nội
                                        </strong>
                                    </div>
                                    <div className='item d-flex align-items-center'>
                                        <FaLocationDot />
                                        <span>Chi nhánh HCM: </span>
                                        <strong>
                                            Tòa nhà Dali, 24C Phan Đăng Lưu,
                                            P.6, Q.Bình Thạnh, TP HCM
                                        </strong>
                                    </div>
                                </div>
                            </div>
                            <div className='col-2 d-flex justify-content-between align-items-center'>
                                <div className='box-qr '>
                                    <img
                                        src='https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/v4/image/footer/qr_code.png'
                                        alt='qr'
                                        style={{ width: '130px' }}
                                    />
                                </div>
                            </div>

                            <div className='col-12'>
                                <div className='list-ecosystem mt-5'>
                                    <div className='title fs-4 fw-bold'>
                                        Hệ sinh thái HR Tech của TopCV
                                    </div>
                                    <div className='box-img-app mt-4 d-flex gap-2  '>
                                        <div className={styles['bg_topcv']}>
                                            <img
                                                className={styles['img-app']}
                                                src='https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/v4/image/footer/topcv-logo.png'
                                                alt=''
                                            />
                                            <span
                                                className={styles['text_app']}
                                            >
                                                Nền tảng công nghệ tuyển dụng
                                                thông minh TopCV.vn
                                            </span>
                                        </div>
                                        <div className={styles['bg_happytime']}>
                                            <img
                                                className={styles['img-app']}
                                                src='https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/v4/image/footer/happy_time.png'
                                                alt=''
                                            />
                                            <span
                                                className={styles['text_app']}
                                            >
                                                Nền tảng quản lý & gia tăng trải
                                                nghiệm nhân viên HappyTime.vn
                                            </span>
                                        </div>
                                        <div
                                            className={styles['bg_testcenter']}
                                        >
                                            <img
                                                className={styles['img-app']}
                                                src='https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/v4/image/footer/testcenter.png'
                                                alt=''
                                            />
                                            <span
                                                className={styles['text_app']}
                                            >
                                                Nền tảng thiết lập và đánh giá
                                                năng lực nhân viên TestCenter.vn
                                            </span>
                                        </div>
                                        <div className={styles['bg_shiring']}>
                                            <img
                                                className={styles['img-app']}
                                                src='https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/v4/image/footer/SHiring.png'
                                                alt=''
                                            />
                                            <span
                                                className={styles['text_app']}
                                            >
                                                Giải pháp quản trị tuyển dụng
                                                hiệu suất cao SHiring.ai
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='col-12'>
                                <p className='text-center'>
                                    © 2014-2024 TopCV Vietnam JSC. All rights
                                    reserved.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Footer;
