import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const QuizCard = ({ topic }) => {
  return (
    <Card className="h-100">
      <Card.Body>
        <Card.Title>{topic.title}</Card.Title>
        <Card.Text className="text-muted small">{topic.description}</Card.Text>
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">{topic.totalQuestions} câu - {topic.timeLimit} phút</small>
          <Link to={`/quiz/${topic.id}`} className="btn btn-primary btn-sm">Làm bài</Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default QuizCard;
