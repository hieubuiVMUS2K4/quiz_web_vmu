import React, { useState } from 'react';
import { Card, Button, Modal, Form, Alert, Row, Col, Badge } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const UserProfile = ({ department }) => {
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleShowModal = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowEditModal(true);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate passwords
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        name: formData.name,
        email: formData.email
      };

      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }

      await api.put(`/users/${user.id}`, updateData);
      setSuccess('Cập nhật thông tin thành công!');
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowEditModal(false);
        setSuccess('');
      }, 2000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <i className="bi bi-person-circle me-2"></i>
            Thông tin cá nhân
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <dl className="row">
                <dt className="col-sm-3">Họ tên:</dt>
                <dd className="col-sm-9">{user.name}</dd>
                
                <dt className="col-sm-3">Email:</dt>
                <dd className="col-sm-9">{user.email}</dd>
                
                <dt className="col-sm-3">Vai trò:</dt>
                <dd className="col-sm-9">
                  <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                    {user.role === 'admin' ? 'Quản trị viên' : 'Sinh viên'}
                  </Badge>
                </dd>
                
                {user.studentId && (
                  <>
                    <dt className="col-sm-3">Mã sinh viên:</dt>
                    <dd className="col-sm-9">{user.studentId}</dd>
                  </>
                )}
                
                {department && (
                  <>
                    <dt className="col-sm-3">Khoa/Viện:</dt>
                    <dd className="col-sm-9">{department}</dd>
                  </>
                )}
              </dl>
            </Col>
            <Col md={4} className="text-center">
              <div 
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '80px', height: '80px', fontSize: '2rem', fontWeight: 'bold' }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <Button variant="outline-primary" size="sm" onClick={handleShowModal}>
                <i className="bi bi-pencil me-1"></i>
                Chỉnh sửa
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa thông tin cá nhân</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Họ tên</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr />
            <h6>Thay đổi mật khẩu (tùy chọn)</h6>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu hiện tại</Form.Label>
                  <Form.Control
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu mới</Form.Label>
                  <Form.Control
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    placeholder="Nhập mật khẩu mới"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Xác nhận mật khẩu</Form.Label>
                  <Form.Control
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="Xác nhận mật khẩu mới"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={loading}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default UserProfile;
