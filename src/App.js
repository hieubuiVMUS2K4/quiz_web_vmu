import React from 'react';
import './App.css';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Card, Container, Row, Col } from 'react-bootstrap';

const App = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="text-center p-5">
              <i className="bi bi-mortarboard-fill text-primary mb-4" style={{ fontSize: '3rem' }}></i>
              <h1 className="display-6 mb-3">Vimaru Quiz</h1>
              <p className="lead text-muted mb-4">
                Hệ thống luyện tập trắc nghiệm tuần sinh hoạt công dân.
              </p>
              <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                <Link to="/login" className="btn btn-primary btn-lg px-4">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Đăng nhập
                </Link>
                <Link to="/home" className="btn btn-outline-secondary btn-lg px-4">
                  <i className="bi bi-house-door me-2"></i>
                  Trang chính
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
