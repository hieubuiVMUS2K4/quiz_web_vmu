import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, ProgressBar, Form, Alert } from 'react-bootstrap';
import api from '../../services/api';

const Quiz = () => {
  const { topicId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/questions?topicId=${topicId}`);
        setQuestions(res.data);
      } catch (error) {
        console.error('Failed to load questions:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [topicId]);

  const handleSelect = (qid, choice) => {
    setAnswers((s) => ({ ...s, [qid]: choice }));
  };

  const handleNext = () => {
    if (index < questions.length - 1) setIndex(index + 1);
  };
  
  const handlePrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const handleSubmit = async () => {
    const correct = questions.reduce((acc, q) => 
      answers[q.id] === q.correct ? acc + 1 : acc, 0);
    const score = (questions.length ? (correct / questions.length) * 100 : 0);

    try {
      await api.post('/progress', { 
        topicId: Number(topicId), 
        score, 
        date: new Date().toISOString() 
      });
      navigate('/stats');
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <Alert variant="info" className="m-4">
        <Alert.Heading>
          <i className="bi bi-info-circle me-2"></i>
          Không có câu hỏi
        </Alert.Heading>
        <p>Chưa có câu hỏi nào cho chuyên đề này.</p>
      </Alert>
    );
  }

  const q = questions[index];
  const progress = ((index + 1) / questions.length) * 100;

  return (
    <div className="container py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white d-flex align-items-center">
          <h5 className="mb-0 flex-grow-1">Câu hỏi {index + 1}/{questions.length}</h5>
          <div className="ms-auto">
            <i className="bi bi-clock me-2"></i>
            Chuyên đề {topicId}
          </div>
        </Card.Header>
        
        <Card.Body className="p-4">
          <ProgressBar 
            now={progress} 
            variant="success" 
            className="mb-4" 
            style={{ height: '0.5rem' }}
          />

          <h4 className="mb-4">{q.title}</h4>

          <Form>
            {q.choices.map((choice, i) => (
              <Form.Check
                key={i}
                type="radio"
                id={`q_${q.id}_${i}`}
                name={`q_${q.id}`}
                className="mb-3"
                checked={answers[q.id] === i}
                onChange={() => handleSelect(q.id, i)}
                label={
                  <span className="ms-2">
                    <strong className="text-primary">{String.fromCharCode(65 + i)}.</strong>
                    {" "}{choice}
                  </span>
                }
              />
            ))}
          </Form>
        </Card.Body>

        <Card.Footer className="bg-light">
          <div className="d-flex justify-content-between">
            <Button
              variant="outline-secondary"
              onClick={handlePrev}
              disabled={index === 0}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Câu trước
            </Button>
            
            <div>
              {index === questions.length - 1 ? (
                <Button variant="success" onClick={handleSubmit}>
                  <i className="bi bi-check2-circle me-2"></i>
                  Nộp bài
                </Button>
              ) : (
                <Button variant="primary" onClick={handleNext}>
                  Câu tiếp
                  <i className="bi bi-arrow-right ms-2"></i>
                </Button>
              )}
            </div>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default Quiz;
