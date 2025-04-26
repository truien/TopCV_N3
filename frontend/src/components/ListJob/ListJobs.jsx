/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import JobCard from './JobCard';
import { toast } from 'react-toastify';
import styles from './Jobs.module.css';
import Topai from '../../assets/images/label-toppy-ai.webp'
import { getPromotedJobs, getJobDetail } from '@/api/jobApi';


const ListJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFilter, setSelectedFilter] = useState('Ngẫu Nhiên');
    const jobsPerPage = 12;
    const filters = ['Ngẫu Nhiên', 'Hà Nội', 'TP.HCM', 'Miền Bắc', 'Miền Nam'];

    const JobDetailCache = {};
    const handleFilterChange = (filter) => {
        console.log('filter', filter);
        setSelectedFilter(filter);
    };

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await getPromotedJobs({
                    page: currentPage,
                    pageSize: jobsPerPage,
                    location: selectedFilter !== 'Ngẫu Nhiên' ? selectedFilter : undefined,
                });
                setJobs(data.jobs);
                setTotalJobs(data.totalJobs);
            } catch (err) {
                toast.error('Đã có lỗi xảy ra, vui lòng thử lại sau');
                console.log('Lỗi', err);
            }
        };

        fetchJobs();
    }, [currentPage, selectedFilter]);
    // Auto next page mỗi 60 giây
    useEffect(() => {
        const interval = setInterval(() => {
            setPage((prev) => (prev < totalPages ? prev + 1 : 1));
        }, 60000);

        return () => clearInterval(interval);
    }, [totalPages]);


    const prefetchJobDetail = async (id) => {
        if (!JobDetailCache[id]) {
            try {
                const data = await getJobDetail(id);
                JobDetailCache[id] = data;
            } catch (error) {
                console.error('Lỗi tải bài viết:', error);
            }
        }
    };

    return (
        <div className='container mt-4'>
            <div className='row'>
                <div className='col-3'><h2 className={styles['titleComponent'] + ' mb-4'}>Việc làm tốt nhất</h2></div>
                <div className='col-3' style={{
                    marginLeft: '-70px'
                }}><img src={Topai} style={{
                    width: '110px',
                    height: '26px',
                    borderLeft: '1px solid',
                    paddingLeft: '10px'
                }}></img></div>

            </div>

            <div className='m mb-3 d-flex flex-wrap gap-2'>
                {filters.map((filter) => (
                    <button
                        key={filter}
                        className={`btn ${filter === selectedFilter
                            ? `btn-success ${styles.btnFilterActive}`
                            : `btn-outline-secondary ${styles.btnFilter}`
                            }`}
                        onClick={() => handleFilterChange(filter)}
                    >
                        {filter}
                    </button>
                ))}
            </div>
            <div className='row job-listings'>
                {jobs.map((job, index) => (
                    <JobCard
                        key={job.id}
                        job={job}
                        fetchJobDetail={prefetchJobDetail}
                        JobDetailCache={JobDetailCache}
                        index={index}
                    />
                ))}
            </div>
            {totalJobs > jobsPerPage && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalJobs / jobsPerPage)}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
};

export default ListJobs;
