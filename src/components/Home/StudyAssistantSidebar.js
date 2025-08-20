import React, { useState, useEffect } from 'react';
import { Card, ProgressBar, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './StudyAssistantSidebar.css';

const StudyAssistantSidebar = () => {
  console.log('StudyAssistantSidebar is rendering!'); // Debug log
  const { user } = useAuth();
  const [progress, setProgress] = useState([]);
  const [topics, setTopics] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressRes, topicsRes, depsRes] = await Promise.all([
          api.get(`/progress?userId=${user.id}`),
          api.get('/topics'),
          api.get('/departments')
        ]);
        setProgress(progressRes.data || []);
        setTopics(topicsRes.data || []);
        setDepartments(depsRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const getCompletedTopics = () => {
    const completedSet = new Set();
    progress.forEach(p => {
      const total = p.totalQuestions || 1;
      const score = (p.correctAnswers / total) * 100;
      if (score >= 80) {
        completedSet.add(p.topicId);
      }
    });
    return completedSet.size;
  };

  const getAverageScore = () => {
    if (progress.length === 0) return 0;
    const totalScore = progress.reduce((sum, p) => {
      const total = p.totalQuestions || 1;
      return sum + (p.correctAnswers / total) * 100;
    }, 0);
    return totalScore / progress.length;
  };

  const getStudyStreak = () => {
    if (progress.length === 0) return 0;
    
    const sortedProgress = progress
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    let streak = 0;
    const today = new Date();
    let currentDate = new Date(today);
    
    for (let i = 0; i < sortedProgress.length; i++) {
      const progressDate = new Date(sortedProgress[i].timestamp);
      const diffDays = Math.floor((currentDate - progressDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        streak++;
        currentDate = progressDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getRecommendedTopic = () => {
    const completedTopicIds = new Set();
    progress.forEach(p => {
      const total = p.totalQuestions || 1;
      const score = (p.correctAnswers / total) * 100;
      if (score >= 80) {
        completedTopicIds.add(p.topicId);
      }
    });

    return topics.find(topic => !completedTopicIds.has(topic.id));
  };

  const getUserDepartment = () => {
    return departments.find(dept => dept.id === user?.departmentId)?.name || 'Chưa xác định';
  };

  const completedTopics = getCompletedTopics();
  const averageScore = getAverageScore();
  const studyStreak = getStudyStreak();
  const recommendedTopic = getRecommendedTopic();
  const completionRate = topics.length > 0 ? (completedTopics / topics.length) * 100 : 0;

  const getCarouselItems = () => {
    const items = [];
    
    // Statistics slide
    items.push({
      id: 'stats',
      component: (
        <Card className="sidebar-card">
          <Card.Header className="card-header-gradient-primary text-white py-2">
            <h6 className="mb-0 small">
              <i className="bi bi-graph-up me-2"></i>
              Thống kê học tập
            </h6>
          </Card.Header>
          <Card.Body className="py-3">
            <div className="row g-3">
              <div className="col-6">
                <div className="stat-box">
                  <h5 className="text-success mb-1 fw-bold">{completedTopics}</h5>
                  <div className="small" style={{ color: 'var(--text)' }}>Chuyên đề hoàn thành</div>
                </div>
              </div>
              <div className="col-6">
                <div className="stat-box">
                  <h5 className="text-info mb-1 fw-bold">{Math.round(averageScore)}%</h5>
                  <div className="small" style={{ color: 'var(--text)' }}>Điểm trung bình</div>
                </div>
              </div>
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small fw-semibold" style={{ color: 'var(--text)' }}>Tiến độ tổng thể</span>
                  <span className="small fw-bold text-primary">{Math.round(completionRate)}%</span>
                </div>
                <ProgressBar 
                  now={completionRate} 
                  variant={completionRate >= 100 ? "success" : completionRate >= 50 ? "warning" : "primary"}
                  className="progress-bar-custom"
                />
              </div>
            </div>
          </Card.Body>
        </Card>
      )
    });

    // Study streak slide
    items.push({
      id: 'streak',
      component: (
        <Card className="sidebar-card">
          <Card.Body className="py-3">
            <div className="streak-container">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <i className="bi bi-fire text-warning" style={{ fontSize: '2.5rem' }}></i>
                </div>
                <div>
                  <h5 className="mb-1 fw-bold text-warning">{studyStreak}</h5>
                  <div className="small" style={{ color: 'var(--text)', opacity: 0.7 }}>Ngày học liên tiếp</div>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      )
    });

    // Recommended topic slide
    if (recommendedTopic) {
      items.push({
        id: 'recommended',
        component: (
          <Card className="sidebar-card">
            <Card.Header className="card-header-gradient-success text-white py-2">
              <h6 className="mb-0 small">
                <i className="bi bi-lightbulb me-2"></i>
                Gợi ý học tập
              </h6>
            </Card.Header>
            <Card.Body className="py-3">
              <h6 className="mb-2 fw-bold">{recommendedTopic.title}</h6>
              <p className="small mb-3" style={{ color: 'var(--text)', opacity: 0.7 }}>{recommendedTopic.description}</p>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <div className="stat-box">
                    <i className="bi bi-question-circle text-primary d-block mb-1" style={{ fontSize: '1.2rem' }}></i>
                    <strong>{recommendedTopic.totalQuestions}</strong>
                    <div className="small" style={{ color: 'var(--text)', opacity: 0.7 }}>câu hỏi</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="stat-box">
                    <i className="bi bi-clock text-warning d-block mb-1" style={{ fontSize: '1.2rem' }}></i>
                    <strong>{recommendedTopic.timeLimit}</strong>
                    <div className="small" style={{ color: 'var(--text)', opacity: 0.7 }}>phút</div>
                  </div>
                </div>
              </div>
              <Button 
                variant="success" 
                size="sm"
                className="w-100 fw-semibold py-2 action-button"
                onClick={() => window.location.href = `/quiz/${recommendedTopic.id}`}
              >
                <i className="bi bi-play-circle me-2"></i>
                Bắt đầu ngay
              </Button>
            </Card.Body>
          </Card>
        )
      });
    }

    // Study tips slide
    items.push({
      id: 'tips',
      component: (
        <Card className="sidebar-card">
          <Card.Header className="card-header-gradient-info text-white py-2">
            <h6 className="mb-0 small">
              <i className="bi bi-star me-2"></i>
              Mẹo học tập
            </h6>
          </Card.Header>
          <Card.Body className="py-3">
            <div>
              {averageScore < 60 ? (
                <Alert variant="warning" className="alert-custom py-2 mb-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <span className="small fw-semibold">Hãy dành thêm thời gian ôn tập để nâng cao điểm số!</span>
                </Alert>
              ) : averageScore >= 80 ? (
                <Alert variant="success" className="alert-custom py-2 mb-3">
                  <i className="bi bi-check-circle me-2"></i>
                  <span className="small fw-semibold">Tuyệt vời! Bạn đang học tập rất tốt!</span>
                </Alert>
              ) : (
                <Alert variant="info" className="alert-custom py-2 mb-3">
                  <i className="bi bi-info-circle me-2"></i>
                  <span className="small fw-semibold">Bạn đang tiến bộ tốt, hãy tiếp tục cố gắng!</span>
                </Alert>
              )}
              
              <ul className="list-unstyled mb-0">
                <li className="tip-item d-flex align-items-center">
                  <i className="bi bi-check2 text-success me-2" style={{ fontSize: '1rem' }}></i>
                  <span className="small" style={{ color: 'var(--text)' }}>Học đều đặn mỗi ngày</span>
                </li>
                <li className="tip-item d-flex align-items-center">
                  <i className="bi bi-check2 text-success me-2" style={{ fontSize: '1rem' }}></i>
                  <span className="small" style={{ color: 'var(--text)' }}>Ôn tập các chuyên đề khó</span>
                </li>
                <li className="tip-item d-flex align-items-center">
                  <i className="bi bi-check2 text-success me-2" style={{ fontSize: '1rem' }}></i>
                  <span className="small" style={{ color: 'var(--text)' }}>Đặt mục tiêu đạt trên 80%</span>
                </li>
                <li className="tip-item d-flex align-items-center">
                  <i className="bi bi-check2 text-success me-2" style={{ fontSize: '1rem' }}></i>
                  <span className="small" style={{ color: 'var(--text)' }}>Nghỉ ngơi hợp lý</span>
                </li>
              </ul>
            </div>
          </Card.Body>
        </Card>
      )
    });

    // Quick actions slide
    items.push({
      id: 'actions',
      component: (
        <Card className="sidebar-card">
          <Card.Header className="card-header-gradient-secondary text-white py-2">
            <h6 className="mb-0 small">
              <i className="bi bi-lightning me-2"></i>
              Thao tác nhanh
            </h6>
          </Card.Header>
          <Card.Body className="py-3">
            <div className="d-grid gap-2">
              <Button 
                variant="outline-primary" 
                size="sm"
                className="py-2 fw-semibold action-button"
                onClick={() => window.location.href = '/progress'}
              >
                <i className="bi bi-graph-up me-2"></i>
                Xem tiến trình chi tiết
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm"
                className="py-2 fw-semibold action-button"
                onClick={() => window.location.href = '/home'}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Làm lại bài thi
              </Button>
            </div>
          </Card.Body>
        </Card>
      )
    });

    return items;
  };

  const carouselItems = getCarouselItems();

  // Carousel auto-slide effect
  useEffect(() => {
    if (loading || carouselItems.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselItems.length);
    }, 2000); // Change slide every 2 seconds

    return () => clearInterval(interval);
  }, [loading, carouselItems.length]);

  if (loading) {
    return (
      <div className="study-sidebar">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="study-sidebar">
      {/* User Avatar - Fixed Section */}
      <div className="user-section">
        <Card className="sidebar-card">
          <Card.Body className="text-center py-3">
            <div 
              className="user-avatar rounded-circle text-white d-flex align-items-center justify-content-center mx-auto mb-3"
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <h6 className="mb-2 fw-bold">{user?.name}</h6>
            <small style={{ color: 'var(--text)', opacity: 0.7 }}>{getUserDepartment()}</small>
          </Card.Body>
        </Card>
      </div>

      {/* Carousel Section */}
      <div className="sidebar-carousel">
        {carouselItems.map((item, index) => (
          <div 
            key={item.id}
            className={`carousel-item ${index === currentSlide ? 'active' : ''}`}
          >
            {item.component}
          </div>
        ))}
        
        {/* Carousel Indicators */}
        <div className="carousel-indicator">
          {carouselItems.map((_, index) => (
            <div
              key={index}
              className={`indicator-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyAssistantSidebar;
