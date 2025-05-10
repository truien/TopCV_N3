import { useSearchParams, Link } from 'react-router-dom';

export default function ConfirmPage() {
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status');

    if (status === 'accepted') {
        return (
            <div style={{ textAlign: 'center', marginTop: 40 }}>
                <h1>✅ Bạn đã xác nhận tham gia phỏng vấn!</h1>
                <p>Cảm ơn bạn, nhà tuyển dụng sẽ liên hệ sớm.</p>
                <Link to="/">Quay về trang chủ</Link>
            </div>
        );
    }
    if (status === 'declined') {
        return (
            <div style={{ textAlign: 'center', marginTop: 40 }}>
                <h1>❌ Bạn đã từ chối phỏng vấn.</h1>
                <p>Nếu thay đổi quyết định, vui lòng liên hệ nhà tuyển dụng.</p>
                <Link to="/">Quay về trang chủ</Link>
            </div>
        );
    }
    return (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
            <h1>⚠️ Liên kết không hợp lệ hoặc đã hết hạn.</h1>
            <Link to="/">Quay về trang chủ</Link>
        </div>
    );
}
