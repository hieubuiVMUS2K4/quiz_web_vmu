import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Badge, ProgressBar, Table } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ProgressPage = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [progressRes, departmentsRes, topicsRes] = await Promise.all([
          api.get(`/progress?userId=${user.id}`),
          api.get('/departments'),
          api.get('/topics')
        ]);
        
        setProgress(progressRes.data);
        setDepartments(departmentsRes.data);
        setTopics(topicsRes.data);
      } catch (err) {
        setError('Không thể tải dữ liệu tiến trình');
        console.error('Error fetching progress data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const calculateProgress = () => {
    if (!progress.length || !topics.length) return { completed: 0, total: topics.length, percentage: 0 };
    
    const completedTopics = new Set(progress.map(p => p.topicId));
    const completed = completedTopics.size;
    const total = topics.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return { completed, total, percentage };
  };

  const getScoreColor = (correctAnswers, totalQuestions) => {
    const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('vi-VN');
  };

  const getUserDepartment = () => {
    return departments.find(dept => dept.id === user?.departmentId)?.name || 'Chưa xác định';
  };

  const progressStats = calculateProgress();

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h2 className="mb-4">
            <i className="bi bi-graph-up-arrow me-2"></i>
            Tiến trình học tập
          </h2>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Thông tin tổng quan */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header className="bg-primary text-white">
              <i className="bi bi-person-badge me-2"></i>
              Thông tin học viên
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                <strong style={{ color: 'var(--text)' }}>Họ tên:</strong> <span style={{ color: 'var(--text)' }}>{user?.name}</span>
              </div>
              <div className="mb-2">
                <strong style={{ color: 'var(--text)' }}>Email:</strong> <span style={{ color: 'var(--text)' }}>{user?.email}</span>
              </div>
              <div className="mb-2">
                <strong style={{ color: 'var(--text)' }}>Mã sinh viên:</strong> <span style={{ color: 'var(--text)' }}>{user?.studentId || 'Chưa cập nhật'}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text)' }}>Khoa/Viện:</strong> <span style={{ color: 'var(--text)' }}>{getUserDepartment()}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Header className="bg-success text-white">
              <i className="bi bi-trophy me-2"></i>
              Tổng quan tiến trình
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ color: 'var(--text)' }}>Tiến độ hoàn thành:</span>
                  <span className="fw-bold" style={{ color: 'var(--text)' }}>{progressStats.completed}/{progressStats.total} chuyên đề</span>
                </div>
                <ProgressBar 
                  now={progressStats.percentage} 
                  label={`${Math.round(progressStats.percentage)}%`}
                  variant={progressStats.percentage >= 80 ? 'success' : progressStats.percentage >= 50 ? 'warning' : 'danger'}
                />
              </div>
              <div className="mb-2">
                <strong style={{ color: 'var(--text)' }}>Tổng số bài đã làm:</strong> <span style={{ color: 'var(--text)' }}>{progress.length}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text)' }}>Chuyên đề đã hoàn thành:</strong> <span style={{ color: 'var(--text)' }}>{progressStats.completed}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Chi tiết tiến trình */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-info text-white">
              <i className="bi bi-list-check me-2"></i>
              Chi tiết kết quả các lần làm bài
            </Card.Header>
            <Card.Body>
              {progress.length === 0 ? (
                <Alert variant="info" className="text-center">
                  <i className="bi bi-info-circle me-2"></i>
                  Bạn chưa làm bài kiểm tra nào. Hãy bắt đầu với <a href="/home" className="alert-link">chuyên đề đầu tiên</a>!
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead className="table-dark">
                      <tr>
                        <th>#</th>
                        <th>Chuyên đề</th>
                        <th>Điểm số</th>
                        <th>Thời gian làm bài</th>
                        <th>Ngày làm</th>
                        <th>Kết quả</th>
                      </tr>
                    </thead>
                    <tbody>
                      {progress
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .map((item, index) => {
                          const scorePercentage = item.totalQuestions > 0 ? (item.correctAnswers / item.totalQuestions) * 100 : 0;
                          const isPassed = scorePercentage >= 80;
                          
                          return (
                            <tr key={item.id}>
                              <td>{index + 1}</td>
                              <td>
                                <div className="fw-bold">{item.topicTitle}</div>
                              </td>
                              <td>
                                <Badge bg={getScoreColor(item.correctAnswers, item.totalQuestions)}>
                                  {item.correctAnswers}/{item.totalQuestions} ({Math.round(scorePercentage)}%)
                                </Badge>
                              </td>
                              <td>
                                <i className="bi bi-clock me-1"></i>
                                {item.timeSpent} phút
                              </td>
                              <td>{formatDate(item.timestamp)}</td>
                              <td>
                                <Badge bg={isPassed ? 'success' : 'danger'}>
                                  {isPassed ? (
                                    <>
                                      <i className="bi bi-check-circle me-1"></i>
                                      Đạt
                                    </>
                                  ) : (
                                    <>
                                      <i className="bi bi-x-circle me-1"></i>
                                      Chưa đạt
                                    </>
                                  )}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gợi ý tiếp theo */}
      {progress.length > 0 && progressStats.percentage < 100 && (
        <Row className="mt-4">
          <Col>
            <Alert variant="primary">
              <Alert.Heading>
                <i className="bi bi-lightbulb me-2"></i>
                Tiếp tục học tập
              </Alert.Heading>
              <p className="mb-0">
                Bạn đã hoàn thành {progressStats.completed}/{progressStats.total} chuyên đề. 
                Hãy tiếp tục với <a href="/home" className="alert-link">các chuyên đề còn lại</a> để hoàn thành chương trình học!
              </p>
            </Alert>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ProgressPage;
