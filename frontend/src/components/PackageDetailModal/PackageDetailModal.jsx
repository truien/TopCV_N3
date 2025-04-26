import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const PackageDetailModal = ({ show, onClose, packageInfo }) => {
    if (!packageInfo) return null;

    const { packageName, startDate, endDate } = packageInfo;

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Chi tiết gói hiển thị</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p><strong>Tên gói:</strong> {packageName}</p>
                <p><strong>Thời gian áp dụng:</strong><br />
                    {new Date(startDate).toLocaleDateString()} → {new Date(endDate).toLocaleDateString()}
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Đóng</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PackageDetailModal;
