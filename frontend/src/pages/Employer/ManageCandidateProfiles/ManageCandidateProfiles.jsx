import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const ManageCandidateProfiles = () => {
    const navigate = useNavigate();
    const username = sessionStorage.getItem('username');
    const [profile, setProfile] = useState([]);

    useEffect(() => {
        if (!username) {
            navigate('/login');
        } else {
            const fetchData = async () => {
                try {
                    const response = await axios.get(
                        `http://localhost:5224/api/Applications/${username}`
                    );
                    setProfile(response.data);
                } catch (error) {
                    console.error('Error:', error);
                }
            };
            fetchData();
        }
    }, [username, navigate]);
    return (
        <>
            <div className='d-flex justify-content-between'>
                <h2>Quản lý hồ sơ ứng viên</h2>
            </div>
            {profile.length > 0 ? (
                <table className='table table-striped'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>ID bài đăng</th>
                            <th>Ngày ứng tuyển</th>
                            <th>Người ứng tuyển</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profile.map((post) => (
                            <tr key={post.id}>
                                <td>{post.id}</td>
                                <td>{post.idJobPost}</td>
                                <td>
                                    {new Date(
                                        post.applicationDate
                                    ).toLocaleDateString()}
                                </td>
                                <td>{post.userJobseeker}</td>
                                <td>
                                    <a
                                        href={post.cvLink}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='btn btn-outline-success btn-sm'
                                    >
                                        Tải CV
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Không có bài đăng nào</p>
            )}
        </>
    );
};

export default ManageCandidateProfiles;
