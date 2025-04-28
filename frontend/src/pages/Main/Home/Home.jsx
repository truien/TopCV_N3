import ListJobs from '../../../components/ListJob/ListJobs.jsx';
import UrgentJobPost from '../../../components/UrgentJobPost/UrgentJobPost.jsx';
import styles from './HomePage.module.css';
function HomePage() {
    return (<>
        <div className={styles.pageBackground}>
            <ListJobs />
            <UrgentJobPost/>
        </div>

    </>);
}

export default HomePage;