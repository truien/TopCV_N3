import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        try {
            const res = await axios.post(`${apiUrl}/api/auth/forgot-password`, { email });
            setMessage(res.data.message);
            setTimeout(() => navigate(`/reset-password?email=${encodeURIComponent(email)}`, { state: { email } }), 2000); // Tự động chuyển sau 2 giây
        } catch (error) {
            setMessage(error.response?.data?.message || "Lỗi xảy ra!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="  " >
            <div className="row overflow-hidden d-flex justify-content-between" >
                <div className="col-md-8 bg-white p-5 d-flex align-items-center justify-content-center ">
                    <div className=" " style={{ marginTop: "-150px" }}>
                        <h3 className="fw-bold" style={{
                            color: "#00b14f",
                            fontSize: "20px",
                            paddingBottom: "20px",
                        }}>Quên mật khẩu</h3>
                        <p style={{
                            color: "#00b14f",
                            fontSize: "14px",
                        }}>Nhập email của bạn để nhận mã OTP đặt lại mật khẩu.</p>
                        <form onSubmit={handleSubmit}>
                            <div className=" input-group" style={{
                                height: "43px",
                                paddingBottom: "24px",
                            }}>
                                <span className="input-group-text bg-light">
                                    <i className="bi bi-envelope"></i>
                                </span>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Nhập email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <p style={{ maxWidth: "500px", fontSize: "14px", padding: "24px 0px" }}>Bằng việc thực hiện đổi mật khẩu, bạn đã đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi</p>
                            <button type="submit" style={{ backgroundColor: "#00b14f" }} className="btn text-white w-100" disabled={loading}>
                                {loading ? "Đang gửi..." : "Tạo lại mật khẩu"}
                            </button>
                        </form>
                        {message && <p className="mt-3" style={{ color: "#00b14f" }}>{message}</p>}
                        <div className="d-flex justify-content-between mt-3">
                            <Link to="/login" className="text-decoration-none" style={{ color: "#00b14f" }}>Quay lại đăng nhập</Link>
                            <Link to="/sign" className="text-decoration-none" style={{ color: "#00b14f" }}>Đăng ký tài khoản mới</Link>
                        </div>
                    </div>


                </div>

                <div className="col-md-4 text-white d-flex align-items-center  " style={{
                    backgroundImage: "url('https://static.topcv.vn/v4/image/auth/auth_bg_desktop.png')",
                    minHeight: "100vh",
                }}
                >
                    <div className="" >
                        <img src="https://static.topcv.vn/v4/image/auth/topcv_white.png" alt="TopCV" width="150" />
                        <h5 className="mt-3" style={{fontSize: "40px",fontWeight: "700"}}>Tiếp lợi thế, nối thành công</h5>
                    </div>
                    <img src="https://static.topcv.vn/v4/image/auth/auth_arrow.png" alt="arrow" width="80" className="mt-2" style={{height: "500px"}} />
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
