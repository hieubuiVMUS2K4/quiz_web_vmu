import React from 'react';
import { Card, Badge, Row, Col } from 'react-bootstrap';
import './UserCard.css';

const UserCard = ({ user, department, showDetails = true, onClick, isClickable = false }) => {
  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return <Badge bg="danger">Quản trị viên</Badge>;
    }
    return <Badge bg="primary">Sinh viên</Badge>;
  };

  const getAvatarInitials = (name) => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <Card 
      className={`h-100 shadow-sm ${isClickable ? 'user-card-clickable' : ''}`}
      onClick={isClickable ? () => onClick(user) : undefined}
      style={{ cursor: isClickable ? 'pointer' : 'default' }}
    >
      <Card.Body>
        <div className="text-center mb-3">
          <div 
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-2"
            style={{ width: '60px', height: '60px', fontSize: '1.5rem', fontWeight: 'bold' }}
          >
            {getAvatarInitials(user.name)}
          </div>
          <h6 className="mb-1">{user.name}</h6>
          {getRoleBadge(user.role)}
        </div>

        {showDetails && (
          <div className="small" style={{ color: 'var(--text)', opacity: 0.7 }}>
            <Row className="g-2">
              <Col xs={12}>
                <div className="d-flex align-items-center">
                  <i className="bi bi-envelope me-2"></i>
                  <span className="text-truncate">{user.email}</span>
                </div>
              </Col>
              {user.studentId && (
                <Col xs={12}>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-card-text me-2"></i>
                    <span>Mã SV: {user.studentId}</span>
                  </div>
                </Col>
              )}
              {department && (
                <Col xs={12}>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-building me-2"></i>
                    <span className="text-truncate">{department}</span>
                  </div>
                </Col>
              )}
              <Col xs={12}>
                <div className="d-flex align-items-center">
                  <i className="bi bi-circle-fill text-success me-2" style={{ fontSize: '0.5rem' }}></i>
                  <span>Đang hoạt động</span>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default UserCard;
