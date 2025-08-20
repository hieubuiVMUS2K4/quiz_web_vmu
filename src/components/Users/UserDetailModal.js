import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Badge, Card } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const UserDetailModal = ({ show, onHide, selectedUser, departments, onUserUpdated }) => {
  const { user: currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    departmentId: '',
    studentId: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        name: selectedUser.name || '',
        email: selectedUser.email || '',
        password: '',
        role: selectedUser.role || 'user',
        departmentId: selectedUser.departmentId || '',
        studentId: selectedUser.studentId || ''
      });
      setIsEditing(false);
      setError('');
      setSuccess('');
    }
  }, [selectedUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password; // Don't update password if empty
      }
      
      await api.put(`/users/${selectedUser.id}`, updateData);
      setSuccess('Cập nhật thông tin thành công!');
      setIsEditing(false);
      
      if (onUserUpdated) {
        onUserUpdated();
      }
    } catch (err) {
      setError('Không thể cập nhật thông tin: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/users/${selectedUser.id}`);
      setSuccess('Xóa người dùng thành công!');
      setTimeout(() => {
        onHide();
        if (onUserUpdated) {
          onUserUpdated();
        }
      }, 1000);
    } catch (err) {
      setError('Không thể xóa người dùng: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.id === parseInt(departmentId));
    return dept ? dept.name : 'Chưa xác định';
  };

  const getAvatarInitials = (name) => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  if (!selectedUser) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-person-circle me-2"></i>
          {isEditing ? 'Chỉnh sửa thông tin' : 'Thông tin chi tiết'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {!isEditing ? (
          // View Mode
          <div>
            <Row className="mb-4">
              <Col md={4} className="text-center">
                <div 
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '100px', height: '100px', fontSize: '2.5rem', fontWeight: 'bold' }}
                >
                  {getAvatarInitials(selectedUser.name)}
                </div>
                <h5>{selectedUser.name}</h5>
                <Badge bg={selectedUser.role === 'admin' ? 'danger' : 'primary'} className="mb-2">
                  {selectedUser.role === 'admin' ? 'Quản trị viên' : 'Sinh viên'}
                </Badge>
              </Col>
              <Col md={8}>
                <Card className="border-0 bg-light">
                  <Card.Body>
                    <Row className="g-3">
                      <Col xs={12}>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-envelope me-3 text-primary"></i>
                          <div>
                            <small className="text-muted d-block">Email</small>
                            <strong>{selectedUser.email}</strong>
                          </div>
                        </div>
                      </Col>
                      {selectedUser.studentId && (
                        <Col xs={12}>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-card-text me-3 text-primary"></i>
                            <div>
                              <small className="text-muted d-block">Mã sinh viên</small>
                              <strong>{selectedUser.studentId}</strong>
                            </div>
                          </div>
                        </Col>
                      )}
                      <Col xs={12}>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-building me-3 text-primary"></i>
                          <div>
                            <small className="text-muted d-block">Khoa/Viện</small>
                            <strong>{getDepartmentName(selectedUser.departmentId)}</strong>
                          </div>
                        </div>
                      </Col>
                      <Col xs={12}>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-circle-fill text-success me-3" style={{ fontSize: '0.8rem' }}></i>
                          <div>
                            <small className="text-muted d-block">Trạng thái</small>
                            <strong className="text-success">Đang hoạt động</strong>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        ) : (
          // Edit Mode
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Họ tên <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu mới</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Để trống nếu không muốn thay đổi"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Vai trò</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="user">Sinh viên</option>
                    <option value="admin">Quản trị viên</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Khoa/Viện</Form.Label>
                  <Form.Select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                  >
                    <option value="">Chọn khoa/viện</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã sinh viên</Form.Label>
                  <Form.Control
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    placeholder="Nhập mã sinh viên"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <div>
          {currentUser?.role === 'admin' && selectedUser.id !== currentUser.id && !isEditing && (
            <Button variant="outline-danger" onClick={handleDelete} disabled={loading}>
              <i className="bi bi-trash me-2"></i>
              Xóa người dùng
            </Button>
          )}
        </div>
        <div className="d-flex gap-2">
          {isEditing ? (
            <>
              <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={loading}>
                Hủy
              </Button>
              <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2 me-2"></i>
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={onHide}>
                Đóng
              </Button>
              {currentUser?.role === 'admin' && (
                <Button variant="primary" onClick={() => setIsEditing(true)}>
                  <i className="bi bi-pencil me-2"></i>
                  Chỉnh sửa
                </Button>
              )}
            </>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default UserDetailModal;
