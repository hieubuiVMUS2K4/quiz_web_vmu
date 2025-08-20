import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import StudyAssistantSidebar from '../components/Home/StudyAssistantSidebar';
import { Container, Row, Col, Card, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/TopicCard.css';

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const topics = useSelector(s => s.quiz.topics);
  const progress = useSelector(s => s.quiz.progress);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const topicsRes = await api.get('/topics');
        dispatch({ type: 'QUIZ_FETCH_TOPICS_SUCCESS', payload: topicsRes.data || [] });
        if (user && user.id) {
          const progRes = await api.get(`/progress?userId=${user.id}`);
          dispatch({ type: 'QUIZ_FETCH_PROGRESS_SUCCESS', payload: progRes.data || [] });
        }
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [dispatch, user]);

  const passedTopics = new Set(progress.filter(p => {
    const total = p.totalQuestions || 1;
    const pct = (p.correctAnswers / total) * 100;
    return pct >= 80;
  }).map(p => p.topicId)).size;
  const overall = topics.length ? Math.round((passedTopics / topics.length) * 100) : 0;

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <StudyAssistantSidebar />
      <div className="flex-grow-1" style={{ marginLeft: '350px', padding: '1.5rem' }}>
        <Container fluid>
          <h4 className="mb-4">
            <i className="bi bi-house-door me-2"></i>
            Dashboard
          </h4>
          
          <Card className="p-4 mb-4 shadow-sm">
            <h5 className="mb-3">
              <i className="bi bi-graph-up me-2"></i>
              Tiến độ tổng quan
            </h5>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-0 text-primary">{overall}%</h2>
                <div className="text-muted">{passedTopics} / {topics.length} chuyên đề đã đạt</div>
              </div>
              <div style={{ width: 300 }}>
                <ProgressBar 
                  now={overall} 
                  variant={overall >= 80 ? "success" : overall >= 50 ? "warning" : "primary"}
                  style={{ height: '12px' }}
                />
              </div>
            </div>
          </Card>

          <h5 className="mb-3">
            <i className="bi bi-book me-2"></i>
            Danh sách chuyên đề
          </h5>
          <Row className="g-4">
            {topics.map(t => (
              <Col md={6} lg={4} key={t.id}>
                <Card className="h-100 shadow-sm border-0 topic-card">
                  <Card.Body>
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center topic-icon" 
                           style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                        <i className="bi bi-book"></i>
                      </div>
                      <div className="text-end">
                        <small className="text-muted">
                          <i className="bi bi-clock me-1"></i>
                          {t.timeLimit} phút
                        </small>
                      </div>
                    </div>
                    <h6 className="mb-2 topic-title">{t.title}</h6>
                    <p className="text-muted small mb-3" style={{ fontSize: '0.85rem' }}>
                      {t.description}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <i className="bi bi-question-circle me-1"></i>
                        {t.totalQuestions} câu hỏi
                      </small>
                      <Link to={`/quiz/${t.id}`} className="btn btn-primary btn-sm quiz-button">
                        <i className="bi bi-play-fill me-1"></i>
                        Làm bài
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default StudentDashboard;
