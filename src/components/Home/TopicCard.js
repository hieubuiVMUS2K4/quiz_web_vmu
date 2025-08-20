import React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../../styles/TopicCard.css';

const TopicCard = ({ topic, progress = [] }) => {
  // Calculate completion percentage
  const attempts = progress.length;
  const bestScore = progress.length > 0 
    ? Math.max(...progress.map(p => (p.correctAnswers / p.totalQuestions) * 100))
    : 0;
  const isPassed = bestScore >= 80;

  return (
    <Card className={`h-100 shadow-sm topic-card ${isPassed ? 'border-success' : ''}`}>
      <Card.Body>
        <Card.Title className="d-flex justify-content-between align-items-start topic-title">
          <span>{topic.title}</span>
          {isPassed && (
            <span className="badge bg-success">
              <i className="bi bi-check-circle me-1"></i>
              Passed
            </span>
          )}
        </Card.Title>
        <Card.Text className="text-muted small mb-3">
          {topic.description}
        </Card.Text>
        <div className="mb-3">
          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>Best Score</span>
            <span>{bestScore.toFixed(1)}%</span>
          </div>
          <ProgressBar 
            now={bestScore} 
            variant={isPassed ? "success" : "primary"}
            className="mb-2"
          />
          <div className="small text-muted">
            <i className="bi bi-clock me-1"></i>
            {topic.timeLimit} minutes | {topic.totalQuestions} questions
          </div>
        </div>
        <div className="d-grid">
          <Link 
            to={`/quiz/${topic.id}`}
            className={`btn quiz-button ${isPassed ? 'btn-outline-success' : 'btn-primary'}`}
          >
            {attempts === 0 ? (
              <>
                <i className="bi bi-play-fill me-1"></i>
                Start Quiz
              </>
            ) : isPassed ? (
              <>
                <i className="bi bi-arrow-repeat me-1"></i>
                Practice Again
              </>
            ) : (
              <>
                <i className="bi bi-arrow-right me-1"></i>
                Continue
              </>
            )}
          </Link>
        </div>
      </Card.Body>
      {attempts > 0 && (
        <Card.Footer className="bg-light text-muted small">
          <i className="bi bi-clock-history me-1"></i>
          {attempts} attempt{attempts !== 1 ? 's' : ''}
        </Card.Footer>
      )}
    </Card>
  );
};

export default TopicCard;
