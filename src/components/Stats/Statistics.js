import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Badge, Row, Col } from 'react-bootstrap';
import api from '../../services/api';

const Statistics = () => {
  const [progress, setProgress] = useState([]);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [progressRes, topicsRes] = await Promise.all([
          api.get('/progress'),
          api.get('/topics')
        ]);
        setProgress(progressRes.data);
        setTopics(topicsRes.data);
      } catch (error) {
        console.error('Failed to load statistics:', error);
      }
    };
    load();
  }, []);

  // Group progress by topic
  const progressByTopic = progress.reduce((acc, p) => {
    const existing = acc[p.topicId] || [];
    return { ...acc, [p.topicId]: [...existing, p] };
  }, {});

  // Calculate best scores
  const bestScores = Object.entries(progressByTopic).map(([topicId, attempts]) => {
    const best = Math.max(...attempts.map(a => a.score));
    return { topicId: Number(topicId), score: best };
  });

  // Overall progress
  const completedTopics = bestScores.filter(s => s.score >= 80).length;
  const overallProgress = (completedTopics / 9) * 100;

  return (
    <Container className="py-4">
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={4} className="text-center border-end">
              <h6 style={{ color: 'var(--text)', opacity: 0.7 }} className="mb-2">Hoàn thành</h6>
              <h2 className="mb-0">{completedTopics}/9</h2>
              <small style={{ color: 'var(--text)', opacity: 0.7 }}>chuyên đề</small>
            </Col>
            <Col md={4} className="text-center border-end">
              <h6 style={{ color: 'var(--text)', opacity: 0.7 }} className="mb-2">Tiến độ tổng thể</h6>
              <h2 className="mb-0">{overallProgress.toFixed(1)}%</h2>
              <small style={{ color: 'var(--text)', opacity: 0.7 }}>hoàn thành</small>
            </Col>
            <Col md={4} className="text-center">
              <h6 style={{ color: 'var(--text)', opacity: 0.7 }} className="mb-2">Trạng thái</h6>
              <h2 className="mb-0">
                <Badge bg={completedTopics === 9 ? "success" : "warning"}>
                  {completedTopics === 9 ? "PASSED" : "IN PROGRESS"}
                </Badge>
              </h2>
              <small style={{ color: 'var(--text)', opacity: 0.7 }}>cần hoàn thành 9/9</small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">
            <i className="bi bi-graph-up me-2"></i>
            Chi tiết tiến độ
          </h5>
        </Card.Header>
        <Table responsive hover className="mb-0">
          <thead className="bg-light">
            <tr>
              <th>Chuyên đề</th>
              <th className="text-center">Số lần làm</th>
              <th className="text-center">Điểm cao nhất</th>
              <th className="text-center">Trạng thái</th>
              <th>Lần làm gần nhất</th>
            </tr>
          </thead>
          <tbody>
            {topics.map(topic => {
              const attempts = progressByTopic[topic.id] || [];
              const bestScore = attempts.length 
                ? Math.max(...attempts.map(a => a.score))
                : 0;
              const lastAttempt = attempts.length 
                ? new Date(Math.max(...attempts.map(a => new Date(a.date))))
                : null;
              
              return (
                <tr key={topic.id}>
                  <td>
                    <strong>{topic.title}</strong>
                  </td>
                  <td className="text-center">{attempts.length}</td>
                  <td className="text-center">
                    <strong className={bestScore >= 80 ? "text-success" : ""}>
                      {bestScore.toFixed(1)}%
                    </strong>
                  </td>
                  <td className="text-center">
                    {bestScore >= 80 ? (
                      <Badge bg="success">Pass</Badge>
                    ) : attempts.length ? (
                      <Badge bg="warning">Chưa đạt</Badge>
                    ) : (
                      <Badge bg="secondary">Chưa làm</Badge>
                    )}
                  </td>
                  <td>
                    {lastAttempt ? (
                      <small style={{ color: 'var(--text)', opacity: 0.7 }}>
                        <i className="bi bi-clock-history me-1"></i>
                        {lastAttempt.toLocaleString()}
                      </small>
                    ) : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default Statistics;
