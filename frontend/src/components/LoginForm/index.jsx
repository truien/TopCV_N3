import { useState } from 'react';
import styles from './styles.module.css';
import { toast } from "react-toastify";
import { Link,useNavigate } from 'react-router-dom';

function SignInForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const handleLogin = async (event) => {
        event.preventDefault();
        if (!email || !password) {
            toast.warning("Vui lòng nhập tên đăng nhập và mật khẩu.", { position: "top-right" });
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ UserName: email, Password: password }),
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || "Đăng nhập thất bại.", { position: "top-right" });
                return;
            }
            const data = await response.json();
            localStorage.setItem("token", data.token);
            if (data.role === "admin") {
                navigate("/admin");
            }


            toast.success("Đăng nhập thành công!", { position: "top-right" });
        } catch (error) {
            toast.error("Tài khoản hoặc mật khẩu không đúng.", { position: "top-right" });
            console.error(error);
        }
    };

    return (
        <>
            <div
                className='d-flex justify-content-center align-items-center'
                style={{ minHeight: '100vh' }}
            >
                <div className='row w-100' style={{ maxWidth: '1400px' }}>
                    <div className={'col-md-7 p-5 border bg-white p-5'}>
                        <div className={styles['form-group']}>
                            <h4 className={styles['header_title']}>
                                Chào mừng bạn đã quay trở lại
                            </h4>
                            <p className={styles['header_caption'] + ' mb-3'}>
                                Cùng xây dựng một hồ sơ nổi bật và nhận được các
                                cơ hội sự nghiệp lý tưởng
                            </p>
                            <form onSubmit={handleLogin}>
                                <div className='mb-3'>
                                    <label
                                        htmlFor='email'
                                        className='form-label'
                                    >
                                        Email
                                    </label>
                                    <div className='input-group'>
                                        <span className='input-group-text'>
                                            <i className='bi bi-envelope-fill text-success'></i>
                                        </span>
                                        <input
                                            className='form-control'
                                            id='email'
                                            placeholder='Email'
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className='mb-3'>
                                    <label
                                        htmlFor='password'
                                        className='form-label'
                                    >
                                        Password
                                    </label>
                                    <div className='input-group'>
                                        <span className='input-group-text'>
                                            <i className='bi bi-shield-lock-fill text-success'></i>
                                        </span>
                                        <input
                                            type='password'
                                            className='form-control'
                                            id='password'
                                            placeholder='Password'
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                        />
                                    </div>
                                    <button
                                        type='button'
                                        className='btn btn-link text-decoration-none'
                                    >
                                        Quên mật khẩu
                                    </button>
                                </div>

                                <button
                                    type='submit'
                                    className='btn btn-success w-100 mb-3'
                                >
                                    Đăng nhập
                                </button>

                                <p className='text-center'>
                                    Hoặc đăng nhập bằng
                                </p>
                                <div className='d-flex justify-content-center gap-2 mb-3'>
                                    <button
                                        type='button'
                                        className='btn btn-danger d-flex align-items-center'
                                    >
                                        <i className='bi bi-google'></i> Google
                                    </button>
                                    <button
                                        type='button'
                                        className='btn btn-primary d-flex align-items-center'
                                    >
                                        <i className='bi bi-facebook'></i>{' '}
                                        Facebook
                                    </button>
                                    <button
                                        type='button'
                                        className='btn btn-info text-white d-flex align-items-center'
                                    >
                                        <i className='bi bi-linkedin'></i>{' '}
                                        LinkedIn
                                    </button>
                                </div>

                                <div className='form-check mb-3'>
                                    <input
                                        type='checkbox'
                                        className='form-check-input'
                                        id='terms'
                                        defaultChecked
                                    />
                                    <label
                                        className='form-check-label'
                                        htmlFor='terms'
                                    >
                                        Bằng việc đăng nhập bằng tài khoản mạng
                                        xã hội, tôi đã đọc và đồng ý với Điều
                                        khoản dịch vụ và Chính sách bảo mật của
                                        TopCV
                                    </label>
                                </div>

                                <p className='text-center mt-3'>
                                    Bạn chưa có tài khoản?{' '}
                                    <Link to='/sign'>Đăng ký ngay</Link>
                                </p>
                            </form>
                        </div>
                    </div>

                    <div
                        className={
                            styles['login_right'] +
                            ' col-md-5 d-none d-md-flex flex-column text-white'
                        }
                    >
                        <img
                            className={styles['img-fluid']}
                            src='https://static.topcv.vn/v4/image/auth/topcv_white.png'
                            alt=''
                        />
                        <h1>Tiếp lợi thế</h1>
                        <h3>Nối thành công</h3>
                        <p>
                            TopCV - Hệ sinh thái nhân sự tiên phong ứng dụng
                            công nghệ tại Việt Nam
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SignInForm;
