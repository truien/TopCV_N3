import axiosInstance from './axiosInstance';

export const isFollowingEmployer = async (employerId) => {
    const res = await axiosInstance.get(`/api/Follow/is-following/${employerId}`);
    return res.data.isFollowing;
};

export const followEmployer = (employerId) =>
    axiosInstance.post(`/api/Follow/follow-employer/${employerId}`);

export const unfollowEmployer = (employerId) =>
    axiosInstance.delete(`/api/Follow/unfollow-employer/${employerId}`);
export const getFollowersCount = employerId =>
    axiosInstance.get(`/api/Follow/employer/${employerId}/followers-count`).then(res => res.data.count);  
