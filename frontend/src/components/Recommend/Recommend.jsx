import styles from './Recommend.module.css'; // Import CSS Module
import { GrFormNextLink } from "react-icons/gr";

function Recommend() {
    return (
        <>
            <div className={styles.recommend + ' py-5'}>
                <div className='container'>
                    <div className=' '>
                        <h2 className={styles['section-title']}>
                            Con số ấn tượng
                        </h2>
                        <p className={styles['section-subtitle']}>
                            TopCV đã được công nhận là nền tảng công nghệ tuyển
                            dụng hàng đầu Việt Nam. Với năng lực lõi là công
                            nghệ, đặc biệt là trí tuệ nhân tạo (AI), sứ mệnh của
                            TopCV đặt ra cho mình là thay đổi thị trường tuyển
                            dụng - nhân sự ngày một hiệu quả hơn. Bằng công
                            nghệ, chúng tôi tạo ra nền tảng cho phép người lao
                            động tạo CV, phát triển được các kỹ năng cá nhân,
                            xây dựng hình ảnh chuyên nghiệp trong mắt nhà tuyển
                            dụng và tiếp cận với các cơ hội việc làm phù hợp.
                        </p>
                    </div>
                    <div className={styles['impressive-numbers']}>
                        <div
                            className={
                                styles['impressive-numbers-row'] +
                                ' d-flex justify-content-center'
                            }
                            style={{ marginLeft: '20px' }}
                        >
                            <div className={styles['impressive-numbers__item']}>
                                <div className='d-flex flex-column'>
                                    <div
                                        className={
                                            styles[
                                                'impressive-numbers__itemnumber'
                                            ]
                                        }
                                    >
                                        <span>540.000</span>+
                                    </div>
                                    <div
                                        className={
                                            styles[
                                                'box-impressive-numbers__item--title'
                                            ]
                                        }
                                    >
                                        Nhà tuyển dụng uy tín
                                    </div>
                                    <div
                                        className={
                                            styles[
                                                'box-impressive-numbers__item--description'
                                            ]
                                        }
                                    >
                                        Các nhà tuyển dụng đến từ tất cả các
                                        ngành nghề và được xác thực bởi TopCV
                                    </div>
                                </div>
                            </div>
                            <div className={styles['impressive-numbers__item']}>
                                <div className='d-flex flex-column'>
                                    <div
                                        className={
                                            styles[
                                                'impressive-numbers__itemnumber'
                                            ]
                                        }
                                    >
                                        <span>200.000</span>+
                                    </div>
                                    <div
                                        className={
                                            styles[
                                                'box-impressive-numbers__item--title'
                                            ]
                                        }
                                    >
                                        Doanh nghiệp hàng đầu
                                    </div>
                                    <div
                                        className={
                                            styles[
                                                'box-impressive-numbers__item--description'
                                            ]
                                        }
                                    >
                                        TopCV được nhiều doanh nghiệp hàng đầu
                                        tin tưởng và đồng hành, trong đó có các
                                        thương hiệu nổi bật như Samsung,
                                        Viettel, Vingroup, FPT, Techcombank,...
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            className={
                                styles['impressive-numbers__bottom'] +
                                ' d-flex justify-content-center align-content-center'
                            }
                            style={{ marginLeft: '22px' }}
                        >
                            <div className={styles['impressive-numbers__item']}>
                                <div className='d-flex flex-column'>
                                    <div
                                        className={
                                            styles[
                                                'impressive-numbers__itemnumber'
                                            ]
                                        }
                                    >
                                        <span>2.000.000</span>+
                                    </div>
                                    <div
                                        className={
                                            styles[
                                                'box-impressive-numbers__item--title'
                                            ]
                                        }
                                    >
                                        Việc làm đã được kết nối
                                    </div>
                                    <div
                                        className={
                                            styles[
                                                'box-impressive-numbers__item--description'
                                            ]
                                        }
                                    >
                                        TopCV đồng hành và kết nối hàng nghìn
                                        ứng viên với những cơ hội việc làm hấp
                                        dẫn từ các doanh nghiệp uy tín.
                                    </div>
                                </div>
                            </div>

                            <div className={styles['impressive-numbers__item']}>
                                <div className='d-flex flex-column'>
                                    <div
                                        className={
                                            styles[
                                                'impressive-numbers__itemnumber'
                                            ]
                                        }
                                    >
                                        <span>1.200.000</span>+
                                    </div>
                                    <div
                                        className={
                                            styles[
                                                'box-impressive-numbers__item--title'
                                            ]
                                        }
                                    >
                                        Lượt tải ứng dụng
                                    </div>
                                    <div
                                        className={
                                            styles[
                                                'box-impressive-numbers__item--description'
                                            ]
                                        }
                                    >
                                        Hàng triệu ứng viên sử dụng ứng dụng
                                        TopCV để tìm kiếm việc làm, trong đó có
                                        60% là ứng viên có kinh nghiệm từ 3 năm
                                        trở lên.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles['topcv-ecosystem'] + ' py-5'} >
                <div className='container'>
                    <h2
                        className='text-center mx-auto fw-bolder'
                        style={{ maxWidth: '700px', color: '#fff' }}
                    >
                        Hệ sinh thái công nghệ nhân sự của TopCV bao gồm 4 sản
                        phẩm chủ lực:
                    </h2>
                    <div className='row mt-4'>
                        <div className='col-md-6 mb-4'>
                            <div className={styles['topcv-products-item']+ ' position-relative p-4 bg-white'}>
                                <h3 className='topcv-product-title'>TopCV</h3>
                                <div className='topcv-product-content'>
                                    Nền tảng công nghệ tuyển dụng thông minh
                                    TopCV.vn
                                </div>
                                <button className={styles['btn-custom-light'] + ' mt-3 p-1'}>
                                    <span >Tìm hiểu thêm <GrFormNextLink/></span>
                                </button>
                                <div className='topcv-product-cover position-absolute top-0 end-0 bottom-0'>
                                    <img
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                        alt='TopCV'
                                        src='https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/v4/image/welcome/ecosystem/topcv.png'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='col-md-6 mb-4'>
                            <div className= {styles['topcv-products-item']+ ' position-relative p-4 bg-white'}>
                                <h3 className='topcv-product-title'>
                                    HappyTime
                                </h3>
                                <div className='topcv-product-content'>
                                    Nền tảng quản lý và gia tăng trải nghiệm
                                    nhân sự
                                </div>
                                <button  className={styles['btn-custom-light'] + ' mt-3 p-1'}>
                                    <span >Tìm hiểu thêm <GrFormNextLink/></span>
                                </button>
                                <div className='topcv-product-cover position-absolute top-0 end-0 bottom-0'>
                                    <img
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                        alt='HappyTime'
                                        src='https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/v4/image/welcome/ecosystem/happytime.png'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='col-md-6 mb-4'>
                            <div className={styles['topcv-products-item']+ ' position-relative p-4 bg-white'}>
                                <h3 className='topcv-product-title'>
                                    TestCenter
                                </h3>
                                <div className='topcv-product-content'>
                                    Nền tảng đánh giá nhân sự và sinh viên
                                    TestCenter.vn
                                </div>
                                <button className={styles['btn-custom-light'] + ' mt-3 p-1'}>
                                    <span >Tìm hiểu thêm <GrFormNextLink/></span>
                                </button>
                                <div className='topcv-product-cover position-absolute top-0 end-0 bottom-0'>
                                    <img
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                        alt='TestCenter'
                                        src='https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/v4/image/welcome/ecosystem/testcenter.png'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='col-md-6 mb-4'>
                            <div className={styles['topcv-products-item']+ ' position-relative p-4 bg-white'}>
                                <h3 className='topcv-product-title'>SHiring</h3>
                                <div className='topcv-product-content'>
                                    Nền tảng tuyển dụng ứng viên tài năng
                                    SHiring.vn
                                </div>
                                <button className={styles['btn-custom-light'] + ' mt-3 p-1'}>
                                    <span >Tìm hiểu thêm <GrFormNextLink/></span>
                                </button>
                                <div className='topcv-product-cover position-absolute top-0 end-0 bottom-0'>
                                    <img
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                        alt='SHiring'
                                        src='https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/v4/image/welcome/ecosystem/shiring.png'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Recommend;
