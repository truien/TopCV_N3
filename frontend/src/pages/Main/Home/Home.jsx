import ListJobs from '../../../components/ListJob/ListJobs.jsx';
import UrgentJobPost from '../../../components/UrgentJobPost/UrgentJobPost.jsx';
import FeaturedCompanies from '../../../components/FeaturedCompanies/FeaturedCompanies.jsx';
import styles from './HomePage.module.css';
function HomePage() {
    return (<>
        <div className={styles.pageBackground}>
            <ListJobs />
            <FeaturedCompanies />
            <UrgentJobPost />
        </div>

    </>);
}

export default HomePage;