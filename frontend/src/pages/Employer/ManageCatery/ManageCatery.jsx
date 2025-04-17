import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';

const ManageCatery = () => {
    const [employment, setEmployment] = useState([]);
    const [fields, setFields] = useState([]);
    const [newField, setNewField] = useState('');
    const [newEmployment, setNewEmployment] = useState('');
    const [editingField, setEditingField] = useState(null); // State cho việc chỉnh sửa ngành nghề
    const [editingEmployment, setEditingEmployment] = useState(null); // State cho việc chỉnh sửa loại công việc

    useEffect(() => {
        const fetchEmploymentData = async () => {
            try {
                const response = await axios.get(
                    'http://localhost:5224/api/JobType/employmenttypes'
                );
                setEmployment(response.data);
            } catch (error) {
                console.error('Error fetching employment types:', error);
            }
        };
        fetchEmploymentData();
    }, []);

    useEffect(() => {
        const fetchFieldsData = async () => {
            try {
                const response = await axios.get(
                    'http://localhost:5224/api/JobType/jobfields'
                );
                setFields(response.data);
            } catch (error) {
                console.error('Error fetching job fields:', error);
            }
        };
        fetchFieldsData();
    }, []);

    const deleteField = async (id) => {
        try {
            await axios.delete(
                `http://localhost:5224/api/JobType/jobfields/${id}`
            );
            setFields(fields.filter((field) => field.id !== id));
            toast.success('Xóa ngành nghề thành công!');
        } catch (error) {
            console.error('Error deleting field:', error);
            toast.error('Xóa ngành nghề thất bại!');
        }
    };

    const deleteEmployment = async (id) => {
        try {
            await axios.delete(
                `http://localhost:5224/api/JobType/employmenttypes/${id}`
            );
            setEmployment(employment.filter((emp) => emp.id !== id));
            toast.success('Xóa loại công việc thành công!');
        } catch (error) {
            console.error('Error deleting employment:', error);
            toast.error('Xóa loại công việc thất bại!');
        }
    };

    // Hàm thêm ngành nghề
    const addField = async () => {
        if (!newField.trim()) {
            toast.error('Tên ngành nghề không thể trống!');
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:5224/api/JobType/jobfields',
                { jobField: newField }
            );
            setFields([...fields, { jobField: newField }]);
            setNewField('');
            toast.success('Thêm ngành nghề thành công!');
        } catch (error) {
            console.error('Error adding field:', error);
            toast.error('Thêm ngành nghề thất bại!');
        }
    };

    // Hàm thêm loại công việc
    const addEmployment = async () => {
        if (!newEmployment.trim()) {
            toast.error('Tên loại công việc không thể trống!');
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:5224/api/JobType/employmenttypes',
                { employmentTypeName: newEmployment }
            );
            setEmployment([
                ...employment,
                { employmentTypeName: newEmployment },
            ]);
            setNewEmployment('');
            toast.success('Thêm loại công việc thành công!');
        } catch (error) {
            console.error('Error adding employment:', error);
            toast.error('Thêm loại công việc thất bại!');
        }
    };

    // Hàm chỉnh sửa ngành nghề
    const editField = (field) => {
        setEditingField(field);
    };

    const saveField = async () => {
        if (!editingField.jobField.trim()) {
            toast.error('Tên ngành nghề không thể trống!');
            return;
        }

        try {
            await axios.put(
                `http://localhost:5224/api/JobType/updateJobField/${editingField.id}`,
                { jobField: editingField.jobField }
            );
            setFields(
                fields.map((field) =>
                    field.id === editingField.id ? editingField : field
                )
            );
            setEditingField(null); // Reset lại chế độ chỉnh sửa
            toast.success('Cập nhật ngành nghề thành công!');
        } catch (error) {
            console.error('Error updating field:', error);
            toast.error('Cập nhật ngành nghề thất bại!');
        }
    };

    // Hàm chỉnh sửa loại công việc
    const editEmployment = (emp) => {
        setEditingEmployment(emp);
    };

    const saveEmployment = async () => {
        if (!editingEmployment.employmentTypeName.trim()) {
            toast.error('Tên loại công việc không thể trống!');
            return;
        }

        try {
            await axios.put(
                `http://localhost:5224/api/JobType/updateEmploymentType/${editingEmployment.id}`,
                { employmentTypeName: editingEmployment.employmentTypeName }
            );
            setEmployment(
                employment.map((emp) =>
                    emp.id === editingEmployment.id ? editingEmployment : emp
                )
            );
            setEditingEmployment(null); // Reset lại chế độ chỉnh sửa
            toast.success('Cập nhật loại công việc thành công!');
        } catch (error) {
            console.error('Error updating employment:', error);
            toast.error('Cập nhật loại công việc thất bại!');
        }
    };

    return (
        <>
            <h1>Manage Catery</h1>

            {/* Thêm Ngành Nghề */}
            <div className='mb-3'>
                <h4>Thêm Ngành Nghề</h4>
                <input
                    type='text'
                    value={newField}
                    onChange={(e) => setNewField(e.target.value)}
                    placeholder='Nhập tên ngành nghề'
                    className='form-control'
                />
                <button className='btn btn-primary mt-2' onClick={addField}>
                    Thêm Ngành Nghề
                </button>
            </div>

            {/* Phần hiển thị Job Fields */}
            <h4>Danh sách Ngành Nghề</h4>
            {fields.length > 0 ? (
                <div>
                    <table className='table table-striped'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên lĩnh vực</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field) => (
                                <tr key={field.id}>
                                    <td>{field.id}</td>
                                    <td>
                                        {editingField &&
                                        editingField.id === field.id ? (
                                            <input
                                                type='text'
                                                value={editingField.jobField}
                                                onChange={(e) =>
                                                    setEditingField({
                                                        ...editingField,
                                                        jobField:
                                                            e.target.value,
                                                    })
                                                }
                                                className='form-control'
                                            />
                                        ) : (
                                            field.jobField
                                        )}
                                    </td>
                                    <td>
                                        {editingField &&
                                        editingField.id === field.id ? (
                                            <button
                                                className='btn btn-success'
                                                onClick={saveField}
                                            >
                                                Lưu
                                            </button>
                                        ) : (
                                            <button
                                                className='btn btn-warning'
                                                onClick={() => editField(field)}
                                            >
                                                <AiOutlineEdit />
                                            </button>
                                        )}
                                        <button
                                            className='btn btn-danger ms-2'
                                            onClick={() =>
                                                deleteField(field.id)
                                            }
                                        >
                                            <AiOutlineDelete />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div>Không có dữ liệu</div>
            )}

            {/* Thêm Loại Công Việc */}
            <div className='mb-3'>
                <h4>Thêm Loại Công Việc</h4>
                <input
                    type='text'
                    value={newEmployment}
                    onChange={(e) => setNewEmployment(e.target.value)}
                    placeholder='Nhập tên loại công việc'
                    className='form-control'
                />
                <button
                    className='btn btn-primary mt-2'
                    onClick={addEmployment}
                >
                    Thêm Loại Công Việc
                </button>
            </div>

            {/* Phần hiển thị Employment Types */}
            <h4>Danh sách Loại Công Việc</h4>
            {employment.length > 0 ? (
                <div>
                    <table className='table table-striped'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Hình thức công việc</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employment.map((emp) => (
                                <tr key={emp.id}>
                                    <td>{emp.id}</td>
                                    <td>
                                        {editingEmployment &&
                                        editingEmployment.id === emp.id ? (
                                            <input
                                                type='text'
                                                value={
                                                    editingEmployment.employmentTypeName
                                                }
                                                onChange={(e) =>
                                                    setEditingEmployment({
                                                        ...editingEmployment,
                                                        employmentTypeName:
                                                            e.target.value,
                                                    })
                                                }
                                                className='form-control'
                                            />
                                        ) : (
                                            emp.employmentTypeName
                                        )}
                                    </td>
                                    <td>
                                        {editingEmployment &&
                                        editingEmployment.id === emp.id ? (
                                            <button
                                                className='btn btn-success'
                                                onClick={saveEmployment}
                                            >
                                                Lưu
                                            </button>
                                        ) : (
                                            <button
                                                className='btn btn-warning'
                                                onClick={() =>
                                                    editEmployment(emp)
                                                }
                                            >
                                                <AiOutlineEdit />
                                            </button>
                                        )}
                                        <button
                                            className='btn btn-danger ms-2'
                                            onClick={() =>
                                                deleteEmployment(emp.id)
                                            }
                                        >
                                            <AiOutlineDelete />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div>Không có dữ liệu</div>
            )}
        </>
    );
};

export default ManageCatery;
