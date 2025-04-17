import ConfirmModal from '@components/ConfirmModal/ConfirmModal.jsx';
import EditJobPostForm from '@components/EditJobPostForm/EditJobPostForm.jsx';
import DOMPurify from 'dompurify';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import {
    AiOutlineDelete,
    AiOutlineEyeInvisible,
    AiOutlineEye,
    AiOutlineFileAdd,
} from 'react-icons/ai';
import { Link, useNavigate } from 'react-router-dom';

function JobPostManage() {
    const navigate = useNavigate();
    const username = sessionStorage.getItem('username');
    const [jobPosts, setJobPosts] = useState([]);
    const [postIdToDelete, setPostIdToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPostId, setCurrentPostId] = useState(null);

    const openDeleteModal = (postId) => {
        document.getElementById('root').setAttribute('inert', 'true');
        setPostIdToDelete(postId);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        document.getElementById('root').removeAttribute('inert');
        setIsDeleteModalOpen(false);
        setPostIdToDelete(null);
    };
    const onEditPost = (Id) => {
        setIsEditing(true);
        setCurrentPostId(Id);
    };
    const onSavePost = () => {
        onCancelEdit();
    };
    const onCancelEdit = () => {
        setIsEditing(false);
        setCurrentPostId(null);
    };
    useEffect(() => {
        if (!username) {
            navigate('/login');
        } else {
            const fetchData = async () => {
                try {
                    const response = await axios.get(
                        `http://localhost:5224/api/Employer/get-jobpost/${username}`
                    );
                    setJobPosts(response.data);
                } catch (error) {
                    console.error('Error:', error);
                }
            };
            fetchData();
        }
    }, [username, navigate]);

    const handleDelete = async () => {
        try {
            await axios.delete(
                `http://localhost:5224/api/JobPosts/delete-jobpost/${postIdToDelete}`
            );
            setJobPosts(jobPosts.filter((post) => post.id !== postIdToDelete));
        } catch (error) {
            toast.error('Có lỗi xảy ra khi xoá bài đăng.');
            console.error('Delete error:', error);
        }
        closeDeleteModal();
    };

    const handleToggleStatus = async (postId, currentStatus) => {
        try {
            const newStatus = currentStatus === 1 ? 2 : 1;
            await axios.put(
                `http://localhost:5224/api/JobPosts/update-jobpost-status/${postId}`,
                newStatus,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            setJobPosts(
                jobPosts.map((post) =>
                    post.id === postId ? { ...post, status: newStatus } : post
                )
            );
        } catch (error) {
            toast.error('Có lỗi xảy ra khi thay đổi trạng thái.');
            console.error('Toggle status error:', error);
        }
    };

    const handleCreateJobPost = () => {
        sessionStorage.setItem('activeLink', '/employer/settings');
        navigate('/employer/createjobpost');
    };
    return (
        <>
            {!isEditing ? (
                <>
                    <div className='d-flex justify-content-between'>
                        <h2>Quản lý bài đăng</h2>
                        <button
                            className='btn btn-success'
                            onClick={handleCreateJobPost}
                        >
                            <AiOutlineFileAdd /> Tạo bài mới
                        </button>
                    </div>
                    {jobPosts.length > 0 ? (
                        <table className='table table-striped'>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tiêu đề</th>
                                    <th>Công ty</th>
                                    <th>Mô tả</th>
                                    <th>Ngày đăng</th>
                                    <th>Khoảng lương</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobPosts.map((post) => (
                                    <tr key={post.id}>
                                        <td>{post.id}</td>
                                        <td>{post.title}</td>
                                        <td>{post.companyName}</td>
                                        <td
                                            dangerouslySetInnerHTML={{
                                                __html: DOMPurify.sanitize(
                                                    post.jobDescription
                                                ),
                                            }}
                                        ></td>
                                        <td>
                                            {new Date(
                                                post.postDate
                                            ).toLocaleDateString()}
                                        </td>
                                        <td>{post.salaryRange}</td>
                                        <td>
                                            <div className='d-flex'>
                                                <button
                                                    className='btn btn-danger me-1'
                                                    onClick={() =>
                                                        openDeleteModal(post.id)
                                                    }
                                                >
                                                    <AiOutlineDelete />
                                                </button>
                                                {post.status === 1 ? (
                                                    <button
                                                        className='btn btn-warning'
                                                        onClick={() =>
                                                            handleToggleStatus(
                                                                post.id,
                                                                post.status
                                                            )
                                                        }
                                                    >
                                                        <AiOutlineEyeInvisible />
                                                    </button>
                                                ) : (
                                                    <button
                                                        className='btn btn-secondary'
                                                        onClick={() =>
                                                            handleToggleStatus(
                                                                post.id,
                                                                post.status
                                                            )
                                                        }
                                                    >
                                                        <AiOutlineEye />
                                                    </button>
                                                )}
                                                <div
                                                    className='btn-group'
                                                    role='group'
                                                >
                                                    <button
                                                        type='button'
                                                        className='btn btn-primary dropdown-toggle'
                                                        data-bs-toggle='dropdown'
                                                        aria-expanded='false'
                                                    ></button>
                                                    <ul className='dropdown-menu'>
                                                        <li>
                                                            <button
                                                                className='dropdown-item'
                                                                onClick={() =>
                                                                    onEditPost(
                                                                        post.id
                                                                    )
                                                                }
                                                            >
                                                                Sửa bài viết
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <Link
                                                                to = '/managecatery'
                                                                className='dropdown-item'
                                                                
                                                            >
                                                                Sửa danh mục
                                                            </Link>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>Không có bài đăng nào</p>
                    )}
                </>
            ) : (
                <EditJobPostForm
                    idPost={currentPostId}
                    onSave={onSavePost}
                    onCancel={onCancelEdit}
                />
            )}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                message='Bạn có chắc chắn muốn xoá bài đăng này?'
            />
        </>
    );
}

export default JobPostManage;
