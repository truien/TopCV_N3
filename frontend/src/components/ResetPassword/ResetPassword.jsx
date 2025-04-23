import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { resetPassword } from '@/api/authApi';


const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState(""); // Ban đầu để rỗng
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const emailFromState = location.state?.email;
        const emailFromQuery = searchParams.get("email");
        if (emailFromState) {
            setEmail(emailFromState);
        } else if (emailFromQuery) {
            setEmail(emailFromQuery);
        } else {
            navigate("/forgot-password"); 
        }
    }, [location.state, searchParams, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage("Mật khẩu xác nhận không khớp!");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const res = await resetPassword({ email, otp, newPassword });
            setMessage(res.message || "Đặt lại mật khẩu thành công");
            navigate("/login");
        } catch (error) {
            setMessage(error.message || "Lỗi xảy ra!");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
            <div className="col-md-5">
                <div className="card shadow-sm p-4" style={{ borderRadius: "10px" }}>
                    <h2 className="text-center mb-3" style={{ color: "#00b14f", fontWeight: "bold" }}>
                        Tạo lại mật khẩu của bạn
                    </h2>
                    <p className="text-center text-muted">
                        Nhập mã OTP và mật khẩu mới để tiếp tục.
                    </p>
                    {message && <div className="alert alert-info">{message}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Email</label>
                            <input type="email" className="form-control" value={email} disabled />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Mã OTP</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Nhập mã OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Mật khẩu mới</label>
                            <div className="input-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control"
                                    placeholder="Nhập mật khẩu mới"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <span
                                    className="input-group-text"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ cursor: "pointer", background: "white" }}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Xác nhận mật khẩu</label>
                            <div className="input-group">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="form-control"
                                    placeholder="Nhập lại mật khẩu"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <span
                                    className="input-group-text"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{ cursor: "pointer", background: "white" }}
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="btn w-100"
                            style={{ backgroundColor: "#00b14f", color: "white", fontWeight: "bold" }}
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : "Tạo mật khẩu mới"}
                        </button>
                    </form>
                    <div className="d-flex justify-content-between mt-3">
                        <Link to="/login" style={{ color: "#00b14f", fontWeight: "bold" }}>Quay lại đăng nhập</Link>
                        <Link to="/register" style={{ color: "#00b14f", fontWeight: "bold" }}>Đăng ký tài khoản mới</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
