import ListJobs from '../../../components/ListJob/ListJobs.jsx';
import styles from './HomePage.module.css';
function HomePage() {
    return (<>
        <div className={styles.pageBackground}>
            <ListJobs />
        </div>

    </>);
}

export default HomePage;