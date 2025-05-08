import { useState } from 'react';
import styles from './styles.module.css';
import { toast } from "react-toastify";
import { Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import SplitText from '../SplitText/SplitText';
import { login, googleLogin, registerWithGoogle } from '@/api/authApi';


function SignInForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showRoleSelection, setShowRoleSelection] = useState(false);
    const [googleUser, setGoogleUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState("");
    const [showSecondLine, setShowSecondLine] = useState(false);
    const navigate = useNavigate();
    const redirectByRole = (role) => {
        if (role === "admin") navigate("/admin");
        else if (role === "employer") navigate("/employer");
        else navigate("/");
    };

    const handleLogin = async (event) => {
        event.preventDefault();

        if (!email || !password) {
            toast.warning("Vui lòng nhập tên đăng nhập và mật khẩu.", { position: "top-right" });
            return;
        }

        try {
            const data = await login({ UserName: email, Password: password });

            toast.success("Đăng nhập thành công!", { position: "top-right" });

            redirectByRole(data.user.role);
        } catch (error) {
            toast.error(error.message || "Đăng nhập thất bại.", { position: "top-right" });
            console.error("Login Error:", error);
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const data = await googleLogin(credentialResponse.credential);

            if (data.requireRoleSelection) {
                setGoogleUser(data);
                setShowRoleSelection(true);
            } else {
                toast.success("Đăng nhập Google thành công!", { position: "top-right" });

                if (data.user.role === "admin") {
                    navigate("/admin");
                } else if (data.user.role === "candidate") {
                    navigate("/");
                } else {
                    navigate("/employer");
                }
            }
        } catch (error) {
            toast.error(error.message || "Đăng nhập Google thất bại.", { position: "top-right" });
            console.error("Google Login Error:", error);
        }
    };

    const handleRegisterWithGoogle = async () => {
        if (!selectedRole) {
            toast.warning("Vui lòng chọn vai trò.", { position: "top-right" });
            return;
        }

        try {
            const payload = {
                email: googleUser.email,
                name: googleUser.name,
                avatar: googleUser.avatar,
                roleId: selectedRole
            };

            await registerWithGoogle(payload);
            toast.success("Đăng ký thành công!", { position: "top-right" });
            navigate('/');
        } catch (error) {
            toast.error(error.message || "Đăng ký Google thất bại.", { position: "top-right" });
            console.error("Google Register Error:", error);
        }
    };



    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '100vh' }}>
                <div className='row w-100' style={{ maxWidth: '1550px' }}>
                    <div className={'col-md-7 p-5 bg-white'}>
                        <div className={styles['form-group']}>
                            <div className={styles['header_title']}>
                                <SplitText
                                    text="Chào mừng bạn đã quay trở lại"
                                    className="text-2xl font-semibold text-center"
                                    delay={100}
                                    animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
                                    animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
                                    easing="easeOutCubic"
                                    threshold={0.2}
                                    rootMargin="-50px"
                                    onLetterAnimationComplete={() => setShowSecondLine(true)}
                                />
                            </div>


                            {showSecondLine ? (
                                <p className={styles['header_caption'] + ' mb-3'}>
                                    <SplitText
                                        text="Cùng xây dựng một hồ sơ nổi bật và nhận được các cơ hội sự nghiệp lý tưởng"
                                        className="text-2xl font-semibold text-center"
                                        delay={50}
                                        animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
                                        animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
                                        easing="easeOutCubic"
                                        threshold={0.2}
                                        rootMargin="-50px"
                                    />
                                </p>
                            )
                                : (<p style={{ opacity: '0' }}>
                                    Cùng xây dựng một hồ sơ nổi bật và nhận được các cơ hội sự nghiệp lý tưởng
                                </p>)}
                            <form onSubmit={handleLogin}>
                                <div className='mb-3'>
                                    <label htmlFor='UserName' className='form-label'>UserName</label>
                                    <div className='input-group'>
                                        <span className='input-group-text'><i className='bi bi-person-circle text-success'></i></span>
                                        <input className='form-control' id='email' placeholder='Email'
                                            value={email} onChange={(e) => setEmail(e.target.value)} />
                                    </div>
                                </div>

                                <div className='mb-3'>
                                    <label htmlFor='password' className='form-label'>Password</label>
                                    <div className='input-group'>
                                        <span className='input-group-text'><i className='bi bi-shield-lock-fill text-success'></i></span>
                                        <input type='password' className='form-control' id='password' placeholder='Password'
                                            value={password} onChange={(e) => setPassword(e.target.value)} />
                                    </div>
                                </div>

                                <button type='submit' className='btn btn-success w-100 mb-3'>Đăng nhập</button>
                                <button type='button' className='btn btn-link text-decoration-none'>
                                    <Link to="/forgot-password">Quên mật khẩu</Link>
                                </button>

                                <p className='text-center'>Hoặc đăng nhập bằng</p>
                                <div className='d-flex justify-content-center gap-2 mb-3'>
                                    <GoogleLogin
                                        onSuccess={handleGoogleLogin}
                                        onError={() => toast.error("Google Login Failed", { position: "top-right" })}
                                    />
                                </div>

                                <div className='form-check mb-3'>
                                    <input type='checkbox' className='form-check-input' id='terms' defaultChecked />
                                    <label className='form-check-label' htmlFor='terms'>
                                        Bằng việc đăng nhập bằng tài khoản mạng xã hội, tôi đã đọc và đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của TopCV
                                    </label>
                                </div>

                                <p className='text-center mt-3'>
                                    Bạn chưa có tài khoản? <Link to='/sign'>Đăng ký ngay</Link>
                                </p>
                            </form>
                        </div>
                    </div>

                    <div className={styles['login_right'] + ' col-md-5 d-none d-md-flex flex-column text-white'}>
                        <img className={styles['img-fluid']} src='https://static.topcv.vn/v4/image/auth/topcv_white.png' alt='' />
                        <h1>Tiếp lợi thế</h1>
                        <h3>Nối thành công</h3>
                        <p>TopCV - Hệ sinh thái nhân sự tiên phong ứng dụng công nghệ tại Việt Nam</p>
                    </div>
                </div>
            </div>
            {showRoleSelection && (
                <div className="modal d-block">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Chọn vai trò</h5>
                                <button type="button" className="btn-close" onClick={() => setShowRoleSelection(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Chào {googleUser.name}, hãy chọn vai trò của bạn:</p>
                                <select className="form-select" onChange={(e) => setSelectedRole(e.target.value)}>
                                    <option value="">-- Chọn vai trò --</option>
                                    <option value="1">Nhà tuyển dụng</option>
                                    <option value="3">Người tìm việc</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-primary" onClick={handleRegisterWithGoogle}>Xác nhận</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


        </GoogleOAuthProvider>
    );
}

export default SignInForm;
