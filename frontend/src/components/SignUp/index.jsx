import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function Sign() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        termsAccepted: false,
        roleId: '1',
    });

    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const validate = () => {
        let validationErrors = {};
        let isValid = true;

        if (!formData.name) {
            validationErrors.name = 'Tài khoản không được để trống';
            isValid = false;
        }

        if (!formData.email) {
            validationErrors.email = 'Email không được để trống';
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/register`,
                {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    roleId: parseInt(formData.roleId),
                }
            );
            console.log(response.data);
            navigate('/login');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '100vh' }}>
            <div className='row w-100'>
                <div className='col-md-7 container-fluid p-4 border rounded bg-white'>
                    <h4 className='text-success text-center'>Chào mừng bạn đến với TopCV</h4>
                    <p className='text-center'>Cùng xây dựng một hồ sơ nổi bật và nhận được các cơ hội sự nghiệp lý tưởng</p>
                    <form onSubmit={handleSubmit}>
                        <div className='mb-3'>
                            <label className='form-label'>Tài khoản</label>
                            <input className='form-control' name='name' value={formData.name} onChange={handleChange} />
                            {errors.name && <small className='text-danger'>{errors.name}</small>}
                        </div>
                        <div className='mb-3'>
                            <label className='form-label'>Email</label>
                            <input className='form-control' name='email' value={formData.email} onChange={handleChange} />
                            {errors.email && <small className='text-danger'>{errors.email}</small>}
                        </div>
                        <div className='mb-3'>
                            <label className='form-label'>Mật khẩu</label>
                            <input type='password' className='form-control' name='password' value={formData.password} onChange={handleChange} />
                            {errors.password && <small className='text-danger'>{errors.password}</small>}
                        </div>
                        <div className='mb-3'>
                            <label className='form-label'>Xác nhận mật khẩu</label>
                            <input type='password' className='form-control' name='confirmPassword' value={formData.confirmPassword} onChange={handleChange} />
                            {errors.confirmPassword && <small className='text-danger'>{errors.confirmPassword}</small>}
                        </div>
                        <div className='form-check mb-3'>
                            <input type='checkbox' className='form-check-input' name='termsAccepted' checked={formData.termsAccepted} onChange={handleChange} />
                            <label className='form-check-label'>Tôi đồng ý với điều khoản</label>
                            {errors.termsAccepted && <small className='text-danger'>{errors.termsAccepted}</small>}
                        </div>
                        <div className='mb-3'>
                            <label className='form-label'>Bạn là</label>
                            <select className='form-select' name='roleId' value={formData.roleId} onChange={handleChange}>
                                <option value='3'>Người tìm việc</option>
                                <option value='1'>Nhà tuyển dụng</option>
                            </select>
                        </div>
                        <button type='submit' className='btn btn-success w-100'>Đăng ký</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Sign;
