// src/pages/Sign/index.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { register } from '@/api/authApi';

function Sign() {
    const [formData, setFormData] = useState({
        name: '',
        fullName: '',      // ← thêm
        companyName: '',   // ← thêm
        email: '',
        password: '',
        confirmPassword: '',
        termsAccepted: false,
        roleId: '3',       // default 3 = candidate
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const validate = () => {
        const validationErrors = {};
        let isValid = true;

        if (!formData.name) {
            validationErrors.name = 'Tài khoản không được để trống';
            isValid = false;
        }
        // Ứng viên: họ tên bắt buộc
        if (formData.roleId === '3' && !formData.fullName) {
            validationErrors.fullName = 'Họ tên không được để trống';
            isValid = false;
        }
        // Nhà tuyển dụng: tên công ty bắt buộc
        if (formData.roleId === '1' && !formData.companyName) {
            validationErrors.companyName = 'Tên công ty không được để trống';
            isValid = false;
        }
        if (!formData.email) {
            validationErrors.email = 'Email không được để trống';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            validationErrors.email = 'Email không hợp lệ';
            isValid = false;
        }
        if (!formData.password) {
            validationErrors.password = 'Mật khẩu không được để trống';
            isValid = false;
        } else if (formData.password.length < 6) {
            validationErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            isValid = false;
        }
        if (formData.password !== formData.confirmPassword) {
            validationErrors.confirmPassword = 'Mật khẩu không khớp';
            isValid = false;
        }
        if (!formData.termsAccepted) {
            validationErrors.termsAccepted = 'Bạn phải đồng ý với điều khoản';
            isValid = false;
        }

        setErrors(validationErrors);
        return isValid;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validate()) return;

        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                roleId: parseInt(formData.roleId, 10),
                fullName: formData.roleId === '3' ? formData.fullName : undefined,
                companyName: formData.roleId === '1' ? formData.companyName : undefined,
            });
            toast.success("Đăng ký thành công!");
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || "Có lỗi xảy ra khi đăng ký.");
        }
    };

    return (
        <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '100vh' }}>
            <div className='col-md-6 p-4 border rounded bg-white'>
                <h4 className='text-success text-center'>Đăng ký tài khoản</h4>
                <form onSubmit={handleSubmit}>
                    <div className='mb-3'>
                        <label className='form-label'>Tài khoản</label>
                        <input
                            name='name'
                            value={formData.name}
                            onChange={handleChange}
                            className='form-control'
                        />
                        {errors.name && <small className='text-danger'>{errors.name}</small>}
                    </div>

                    {/* Họ tên chỉ với candidate */}
                    {formData.roleId === '3' && (
                        <div className='mb-3'>
                            <label className='form-label'>Họ tên đầy đủ</label>
                            <input
                                name='fullName'
                                value={formData.fullName}
                                onChange={handleChange}
                                className='form-control'
                            />
                            {errors.fullName && <small className='text-danger'>{errors.fullName}</small>}
                        </div>
                    )}

                    {/* Tên công ty chỉ với employer */}
                    {formData.roleId === '1' && (
                        <div className='mb-3'>
                            <label className='form-label'>Tên công ty</label>
                            <input
                                name='companyName'
                                value={formData.companyName}
                                onChange={handleChange}
                                className='form-control'
                            />
                            {errors.companyName && <small className='text-danger'>{errors.companyName}</small>}
                        </div>
                    )}

                    <div className='mb-3'>
                        <label className='form-label'>Email</label>
                        <input
                            name='email'
                            value={formData.email}
                            onChange={handleChange}
                            className='form-control'
                        />
                        {errors.email && <small className='text-danger'>{errors.email}</small>}
                    </div>

                    <div className='mb-3'>
                        <label className='form-label'>Mật khẩu</label>
                        <input
                            type='password'
                            name='password'
                            value={formData.password}
                            onChange={handleChange}
                            className='form-control'
                        />
                        {errors.password && <small className='text-danger'>{errors.password}</small>}
                    </div>

                    <div className='mb-3'>
                        <label className='form-label'>Xác nhận mật khẩu</label>
                        <input
                            type='password'
                            name='confirmPassword'
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className='form-control'
                        />
                        {errors.confirmPassword && <small className='text-danger'>{errors.confirmPassword}</small>}
                    </div>

                    <div className='form-check mb-3'>
                        <input
                            type='checkbox'
                            name='termsAccepted'
                            checked={formData.termsAccepted}
                            onChange={handleChange}
                            className='form-check-input'
                        />
                        <label className='form-check-label'>Tôi đồng ý với điều khoản</label>
                        {errors.termsAccepted && <small className='text-danger'>{errors.termsAccepted}</small>}
                    </div>

                    <div className='mb-3'>
                        <label className='form-label'>Bạn là</label>
                        <select
                            name='roleId'
                            value={formData.roleId}
                            onChange={handleChange}
                            className='form-select'
                        >
                            <option value='3'>Người tìm việc</option>
                            <option value='1'>Nhà tuyển dụng</option>
                        </select>
                    </div>

                    <button type='submit' className='btn btn-success w-100'>Đăng ký</button>
                </form>
            </div>
        </div>
    );
}

export default Sign;
