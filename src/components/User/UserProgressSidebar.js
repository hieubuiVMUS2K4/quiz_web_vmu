import React from 'react';
import { Card, ProgressBar, Badge } from 'react-bootstrap';

const UserProgressSidebar = ({ progress = [], totalTopics = 9 }) => {
  if (!Array.isArray(progress)) progress = [];

  // Group progress by topicId
  const progressByTopic = progress.reduce((acc, p) => {
    const key = p.topicId || 'unknown';
    const existing = acc[key] || [];
    return { ...acc, [key]: [...existing, p] };
  }, {});

  // For each attempt compute a score (from correctAnswers/totalQuestions)
  const bestScores = Object.entries(progressByTopic).map(([topicId, attempts]) => {
    const scores = attempts.map(a => {
      const total = a.totalQuestions || 1;
      const correct = typeof a.correctAnswers === 'number' ? a.correctAnswers : 0;
      return Math.round((correct / total) * 100);
    });
    const best = scores.length ? Math.max(...scores) : 0;
    return { topicId: Number(topicId) || topicId, score: best };
  });

  const completedTopics = bestScores.filter(s => s.score >= 80).length;
  const overallProgress = Math.round((completedTopics / (totalTopics || 1)) * 100);

  // Sort recent attempts by timestamp (desc) and show recent 5
  const recentAttempts = [...progress]
    .filter(p => p && p.timestamp)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  return (
    <div className="bg-light border-end h-100 p-4" style={{ width: 300 }}>
      <h5 className="mb-4">
        <i className="bi bi-person-badge me-2" aria-hidden="true"></i>
        Tiến độ của bạn
      </h5>

      {/* Overall progress */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h6 style={{ color: 'var(--text)' }} className="mb-2">Tiến độ tổng thể</h6>
          <ProgressBar
            now={overallProgress}
            variant={overallProgress >= 100 ? 'success' : 'primary'}
            className="mb-2"
          />
          <small style={{ color: 'var(--text)', opacity: 0.7 }}>
            Hoàn thành {completedTopics}/{totalTopics} chuyên đề
          </small>
        </Card.Body>
      </Card>

      {/* Recent attempts */}
      <h6 className="mb-3" style={{ color: 'var(--text)' }}>Lần làm gần đây</h6>
      {recentAttempts.length === 0 && (
        <small style={{ color: 'var(--text)', opacity: 0.7 }}>Chưa có lần làm nào.</small>
      )}
      {recentAttempts.map((p) => {
        const total = p.totalQuestions || 0;
        const correct = typeof p.correctAnswers === 'number' ? p.correctAnswers : 0;
        const score = total ? Math.round((correct / total) * 100) : 0;
        return (
          <Card key={p.id || `${p.userId}-${p.topicId}-${p.timestamp}`} className="mb-2 shadow-sm">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <small style={{ color: 'var(--text)', opacity: 0.7 }}>Chuyên đề {p.topicId}</small>
                <Badge bg={score >= 80 ? 'success' : 'warning'}>
                  {score}%
                </Badge>
              </div>
              <div className="d-flex justify-content-between">
                <small style={{ color: 'var(--text)', opacity: 0.7 }}>
                  {correct}/{total} câu
                </small>
                <small style={{ color: 'var(--text)', opacity: 0.7 }}>
                  {p.timeSpent ?? '—'} phút
                </small>
              </div>
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
};

export default UserProgressSidebar;
