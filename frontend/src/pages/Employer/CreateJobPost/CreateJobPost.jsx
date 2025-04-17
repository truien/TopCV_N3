import React, { useEffect, useState } from 'react';
import styles from './CreateJobPost.module.css';
import RichTextEditor from '../../../components/RichTextEditor/RichTextEditor';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

function CreateJobPost() {
    const navigate = useNavigate();
    const [jobFields, setJobFields] = useState([]);
    const [employmentTypes, setEmploymentTypes] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);
    const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        interest: '',
        salaryRange: '',
        location: '',
        applyDeadline: '',
        jobOpeningCount: 1
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/api/jobfields`)
            .then(res => setJobFields(res.data))
            .catch(() => toast.error('Lỗi khi tải danh sách ngành nghề'));

        axios.get(`${import.meta.env.VITE_API_URL}/api/employmenttypes`)
            .then(res => setEmploymentTypes(res.data))
            .catch(() => toast.error('Lỗi khi tải hình thức làm việc'));
    }, []);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Tiêu đề không được để trống';
        if (!formData.description) newErrors.description = 'Nhập mô tả công việc';
        if (!formData.requirements) newErrors.requirements = 'Nhập yêu cầu công việc';
        if (!formData.interest) newErrors.interest = 'Nhập quyền lợi';
        if (!formData.salaryRange.trim()) newErrors.salaryRange = 'Nhập mức lương';
        if (!formData.location.trim()) newErrors.location = 'Nhập địa điểm';
        if (!formData.applyDeadline) newErrors.applyDeadline = 'Chọn hạn nộp hồ sơ';
        if (formData.jobOpeningCount <= 0) newErrors.jobOpeningCount = 'Phải lớn hơn 0';
        if (selectedFields.length === 0) newErrors.fields = 'Chọn ít nhất 1 ngành nghề';
        if (selectedEmploymentTypes.length === 0) newErrors.types = 'Chọn ít nhất 1 hình thức';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const token = sessionStorage.getItem('token');
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/JobPosts/create`,
                {
                    ...formData,
                    jobFieldIds: selectedFields.map(f => f.value),
                    employmentTypeIds: selectedEmploymentTypes.map(e => e.value)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            toast.success('Đăng tin thành công');
            navigate('/employer');
        } catch (err) {
            toast.error('Có lỗi xảy ra khi đăng tin');
            console.log(err);
        }
    };

    return (
        <div className='container mt-4'>
            <div className='row justify-content-center'>
                <div className='col-md-10'>
                    <div className={`border p-4 ${styles['form-wrapper']}`}>
                        <h3 className='mb-4 fw-bold'>Tạo bài tuyển dụng</h3>
                        <form onSubmit={handleSubmit}>
                            <div className='mb-3'>
                                <label className='form-label fw-semibold'>Tiêu đề</label>
                                <input className='form-control' name='title' value={formData.title} onChange={handleChange} />
                                {errors.title && <p className='text-danger'>{errors.title}</p>}
                            </div>

                            <div className='mb-3'>
                                <label className='form-label fw-semibold'>Mô tả công việc</label>
                                <RichTextEditor value={formData.description} onChange={(v) => setFormData({ ...formData, description: v })} />
                                {errors.description && <p className='text-danger'>{errors.description}</p>}
                            </div>

                            <div className='mb-3'>
                                <label className='form-label fw-semibold'>Yêu cầu</label>
                                <RichTextEditor value={formData.requirements} onChange={(v) => setFormData({ ...formData, requirements: v })} />
                                {errors.requirements && <p className='text-danger'>{errors.requirements}</p>}
                            </div>

                            <div className='mb-3'>
                                <label className='form-label fw-semibold'>Quyền lợi</label>
                                <RichTextEditor value={formData.interest} onChange={(v) => setFormData({ ...formData, interest: v })} />
                                {errors.interest && <p className='text-danger'>{errors.interest}</p>}
                            </div>

                            <div className='row'>
                                <div className='col-md-6 mb-3'>
                                    <label className='form-label fw-semibold'>Mức lương</label>
                                    <input className='form-control' name='salaryRange' value={formData.salaryRange} onChange={handleChange} />
                                    {errors.salaryRange && <p className='text-danger'>{errors.salaryRange}</p>}
                                </div>

                                <div className='col-md-6 mb-3'>
                                    <label className='form-label fw-semibold'>Địa điểm</label>
                                    <input className='form-control' name='location' value={formData.location} onChange={handleChange} />
                                    {errors.location && <p className='text-danger'>{errors.location}</p>}
                                </div>
                            </div>

                            <div className='row'>
                                <div className='col-md-6 mb-3'>
                                    <label className='form-label fw-semibold'>Hạn nộp hồ sơ</label>
                                    <input className='form-control' type='date' name='applyDeadline' value={formData.applyDeadline} onChange={handleChange} />
                                    {errors.applyDeadline && <p className='text-danger'>{errors.applyDeadline}</p>}
                                </div>
                                <div className='col-md-6 mb-3'>
                                    <label className='form-label fw-semibold'>Số lượng tuyển</label>
                                    <input className='form-control' type='number' name='jobOpeningCount' value={formData.jobOpeningCount} onChange={handleChange} />
                                    {errors.jobOpeningCount && <p className='text-danger'>{errors.jobOpeningCount}</p>}
                                </div>
                            </div>

                            <div className='mb-3'>
                                <label className='form-label fw-semibold'>Ngành nghề</label>
                                <Select
                                    isMulti
                                    options={jobFields.map(f => ({ label: f.name, value: f.id }))}
                                    onChange={setSelectedFields}
                                    classNamePrefix='select'
                                />
                                {errors.fields && <p className='text-danger'>{errors.fields}</p>}
                            </div>

                            <div className='mb-3'>
                                <label className='form-label fw-semibold'>Hình thức làm việc</label>
                                <Select
                                    isMulti
                                    options={employmentTypes.map(e => ({ label: e.name, value: e.id }))}
                                    onChange={setSelectedEmploymentTypes}
                                    classNamePrefix='select'
                                />
                                {errors.types && <p className='text-danger'>{errors.types}</p>}
                            </div>

                            <div className='text-end'>
                                <button type='submit' className={`btn ${styles['btn-custome']}`}>Đăng tin</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateJobPost;