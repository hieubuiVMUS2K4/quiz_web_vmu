import React from 'react';
import { ProgressBar } from 'react-bootstrap';

const UserProgressSidebar = ({ progress = [], totalTopics = 9 }) => {
  // Calculate overall progress
  const passedTopics = new Set(
    progress
      .filter(p => {
        const total = p.totalQuestions || 1;
        const pct = (p.correctAnswers / total) * 100;
        return pct >= 80;
      })
      .map(p => p.topicId)
  ).size;

  const overallProgress = totalTopics ? (passedTopics / totalTopics) * 100 : 0;

  return (
    <div className="bg-light p-4" style={{ width: '300px', minHeight: '100vh' }}>
      <h5 className="mb-4">
        <i className="bi bi-person-check me-2"></i>
        Your Progress
      </h5>
      
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="text-muted">Overall Completion</span>
          <span className="text-muted">{Math.round(overallProgress)}%</span>
        </div>
        <ProgressBar 
          now={overallProgress} 
          variant={overallProgress >= 100 ? "success" : "primary"}
        />
        <small className="text-muted d-block mt-2">
          {passedTopics} of {totalTopics} topics completed
        </small>
      </div>

      <div className="mb-4">
        <h6 className="mb-3">Requirements</h6>
        <ul className="list-unstyled">
          <li className="mb-2">
            <i className={`bi bi-${passedTopics >= totalTopics ? 'check-circle-fill text-success' : 'circle'} me-2`}></i>
            Complete all {totalTopics} topics
          </li>
          <li className="mb-2">
            <i className="bi bi-info-circle me-2"></i>
            Score 80% or higher on each topic
          </li>
        </ul>
      </div>

      {progress.length > 0 && (
        <div>
          <h6 className="mb-3">Recent Activity</h6>
          <div className="small">
            {progress.slice(-3).reverse().map((p) => {
              const total = p.totalQuestions || 1;
              const correct = typeof p.correctAnswers === 'number' ? p.correctAnswers : 0;
              const score = total ? ((correct / total) * 100).toFixed(1) : '0.0';
              const key = p.id || `${p.userId}-${p.topicId}-${p.timestamp}`;
              return (
                <div key={key} className="mb-2 pb-2 border-bottom">
                  <div className="fw-bold">{p.topicTitle}</div>
                  <div className="text-muted">Score: {score}%</div>
                  <div className="text-muted">
                    <i className="bi bi-clock-history me-1"></i>
                    {p.timestamp ? new Date(p.timestamp).toLocaleDateString() : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProgressSidebar;
