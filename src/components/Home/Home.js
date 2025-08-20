import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import StudyAssistantSidebar from './StudyAssistantSidebar';
import TopicCard from './TopicCard';
import axios from 'axios';

const Home = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const topicsRes = await axios.get('/topics');
        let progressRes = { data: [] };
        if (user && user.id) {
          progressRes = await axios.get(`/progress?userId=${user.id}`);
        }
        setTopics(topicsRes.data || []);
        setProgress(progressRes.data || []);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Group progress by topic
  const progressByTopic = progress.reduce((acc, p) => {
    const existing = acc[p.topicId] || [];
    return { ...acc, [p.topicId]: [...existing, p] };
  }, {});

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <StudyAssistantSidebar />
      <div className="flex-grow-1" style={{ marginLeft: '350px', padding: '1.5rem' }}>
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4>
              <i className="bi bi-book me-2"></i>
              Danh sách chuyên đề
            </h4>
            <Link to="/stats" className="btn btn-outline-primary">
              <i className="bi bi-graph-up me-2"></i>
              Xem thống kê chi tiết
            </Link>
          </div>

          <Row xs={1} md={2} lg={3} className="g-4">
            {topics.map((topic) => (
              <Col key={topic.id}>
                <TopicCard 
                  topic={topic} 
                  progress={progressByTopic[topic.id]}
                />
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Home;
