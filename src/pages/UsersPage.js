import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import UserCard from '../components/Users/UserCard';
import UserProfile from '../components/Users/UserProfile';
import UserDetailModal from '../components/Users/UserDetailModal';
import api from '../services/api';

const UsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    departmentId: '',
    studentId: ''
  });
  const [error, setError] = useState('');

  // Kiểm tra nếu user chỉ là sinh viên thường
  const isStudent = user?.role === 'user';

  const loadData = useCallback(async () => {
    try {
      const [usersRes, depsRes] = await Promise.all([
        api.get('/users'),
        api.get('/departments')
      ]);
      
      // Nếu là sinh viên, chỉ lấy thông tin của chính họ
      if (isStudent) {
        setUsers([user]);
      } else {
        setUsers(usersRes.data || []);
      }
      setDepartments(depsRes.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [isStudent, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleShowModal = (userToEdit = null) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        password: '',
        role: userToEdit.role,
        departmentId: userToEdit.departmentId || '',
        studentId: userToEdit.studentId || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        departmentId: '',
        studentId: ''
      });
    }
    setShowModal(true);
    setError('');
  };

  const handleUserClick = (clickedUser) => {
    setSelectedUser(clickedUser);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedUser(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingUser) {
        // Update user
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password; // Don't update password if empty
        }
        await api.put(`/users/${editingUser.id}`, updateData);
      } else {
        // Create new user
        if (!formData.password) {
          setError('Mật khẩu là bắt buộc khi tạo user mới');
          return;
        }
        await api.post('/users', formData);
      }
      
      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save user:', error);
      setError('Có lỗi xảy ra khi lưu thông tin user');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa user này?')) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      await loadData();
    } catch (error) {
      console.error('Failed to delete user:', error);
      setError('Không thể xóa user');
    }
  };

  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.name : 'Chưa phân khoa';
  };

  const filteredUsers = filterDepartment 
    ? users.filter(u => u.departmentId === Number(filterDepartment))
    : users;

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const renderCardView = () => (
    <Row xs={1} md={2} lg={3} xl={4} className="g-4">
      {filteredUsers.map((u) => (
        <Col key={u.id}>
          <UserCard 
            user={u} 
            department={getDepartmentName(u.departmentId)}
            showDetails={true}
            isClickable={!isStudent}
            onClick={isStudent ? undefined : handleUserClick}
          />
        </Col>
      ))}
    </Row>
  );

  const renderTableView = () => (
    <Card>
      <Card.Body>
        <div className="table-responsive">
          <Table striped hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Khoa/Viện</th>
                <th>Mã SV</th>
                <th>Trạng thái</th>
                {user?.role === 'admin' && <th>Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <Badge bg={u.role === 'admin' ? 'danger' : 'primary'}>
                      {u.role === 'admin' ? 'Quản trị viên' : 'Sinh viên'}
                    </Badge>
                  </td>
                  <td>{getDepartmentName(u.departmentId)}</td>
                  <td>{u.studentId || '—'}</td>
                  <td>
                    <Badge bg="success">Hoạt động</Badge>
                  </td>
                  {user?.role === 'admin' && (
                    <td>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowModal(u)}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      {u.id !== user.id && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(u.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          {/* User Profile Section - chỉ hiển thị cho sinh viên trong trường hợp họ vào trực tiếp */}
          {isStudent && (
            <UserProfile department={getDepartmentName(user?.departmentId)} />
          )}

          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4>
              <i className="bi bi-people me-2"></i>
              {isStudent ? 'Thông tin cá nhân' : 'Quản lý người dùng'}
            </h4>
            {!isStudent && (
              <div className="d-flex gap-2">
                {/* View Mode Toggle */}
                <div className="btn-group" role="group">
                  <Button
                    variant={viewMode === 'cards' ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                  >
                    <i className="bi bi-grid"></i>
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    <i className="bi bi-table"></i>
                  </Button>
                </div>
                
                {user?.role === 'admin' && (
                  <Button variant="primary" onClick={() => handleShowModal()}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Thêm người dùng
                  </Button>
                )}
              </div>
            )}
          </div>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Statistics Cards */}
          {user?.role === 'admin' && (
            <Row className="mb-4">
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h3 className="text-primary">{users.length}</h3>
                    <small className="text-muted">Tổng người dùng</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h3 className="text-success">
                      {users.filter(u => u.role === 'user').length}
                    </h3>
                    <small className="text-muted">Sinh viên</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h3 className="text-danger">
                      {users.filter(u => u.role === 'admin').length}
                    </h3>
                    <small className="text-muted">Quản trị viên</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h3 className="text-info">
                      {new Set(users.map(u => u.departmentId).filter(Boolean)).size}
                    </h3>
                    <small className="text-muted">Khoa/Viện</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Filter - chỉ hiển thị cho admin */}
          {!isStudent && (
            <Row className="mb-4">
              <Col md={4}>
                <Form.Select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                >
                  <option value="">Tất cả khoa/viện</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={8}>
                <div className="text-muted small">
                  Hiển thị {filteredUsers.length} / {users.length} người dùng
                </div>
              </Col>
            </Row>
          )}

          {/* Content */}
          {isStudent ? (
            // Hiển thị thông tin cá nhân cho sinh viên
            <Row className="mt-4">
              <Col md={6} className="mx-auto">
                <UserCard 
                  user={user} 
                  department={getDepartmentName(user?.departmentId)}
                  showDetails={true}
                  isClickable={false}
                />
              </Col>
            </Row>
          ) : (
            // Hiển thị danh sách đầy đủ cho admin
            viewMode === 'cards' ? renderCardView() : renderTableView()
          )}
        </Col>
      </Row>

      {/* Modal for Add/Edit User */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên <span className="text-danger">*</span></Form.Label>
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
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Mật khẩu {!editingUser && <span className="text-danger">*</span>}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder={editingUser ? "Để trống nếu không muốn thay đổi" : ""}
                    required={!editingUser}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Vai trò</Form.Label>
                  <Form.Select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
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
                    value={formData.departmentId}
                    onChange={(e) => setFormData({...formData, departmentId: Number(e.target.value)})}
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
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                    placeholder="Nhập mã sinh viên"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {editingUser ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* User Detail Modal */}
      <UserDetailModal
        show={showDetailModal}
        onHide={handleCloseDetailModal}
        selectedUser={selectedUser}
        departments={departments}
        onUserUpdated={loadData}
      />
    </Container>
  );
};

export default UsersPage;
