import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Form, Alert, Badge, ProgressBar } from 'react-bootstrap';
import api from '../../services/api';
import ErrorBoundary from '../ErrorBoundary';
import '../../styles/QuizInterface.css';

const QuizInterface = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [topicData, setTopicData] = useState(null);
  const [existingProgress, setExistingProgress] = useState(null);

  // Question pagination (10 questions per page)
  const questionsPerPage = 10;
  const currentPage = Math.floor(currentQuestionIndex / questionsPerPage);
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  // Load topic data and questions
  useEffect(() => {
    const loadQuizData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load topic information
        const topicRes = await api.get(`/topics/${topicId}`);
        setTopicData(topicRes.data);

        // Load questions
        const questionsRes = await api.get(`/questions?topicId=${topicId}`);
        setQuestions(questionsRes.data);

        // Check if user has existing progress
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          try {
            const progressRes = await api.get(`/progress?userId=${user.id}&topicId=${topicId}`);
            if (progressRes.data.length > 0) {
              const latestProgress = progressRes.data[progressRes.data.length - 1];
              setExistingProgress(latestProgress);
              
              // If user has saved answers, restore them
              if (latestProgress.savedAnswers) {
                setAnswers(latestProgress.savedAnswers);
              }
              
              // If quiz was completed, show results
              if (latestProgress.completed) {
                setQuizSubmitted(true);
                setScore(latestProgress.score);
                const correct = Object.keys(latestProgress.savedAnswers || {}).filter(qId => {
                  const question = questionsRes.data.find(q => q.id === parseInt(qId));
                  return question && latestProgress.savedAnswers[qId] === question.correct;
                }).length;
                setCorrectAnswers(correct);
              }
            }
          } catch (progressError) {
            console.warn('Failed to load progress data:', progressError);
            // Continue without progress data
          }
        }
      } catch (error) {
        console.error('Failed to load quiz data:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    loadQuizData();
  }, [topicId]);

  // Timer effect
  useEffect(() => {
    if (quizStarted && !quizSubmitted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQuiz(true); // Auto submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizStarted, quizSubmitted, timeLeft]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (quizStarted && !quizSubmitted) {
      const autoSave = setInterval(() => {
        saveProgress(false);
      }, 30000); // Save every 30 seconds

      return () => clearInterval(autoSave);
    }
  }, [quizStarted, quizSubmitted, answers]);

  // Format time display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  // Navigate to specific question
  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  // Navigate between question pages
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      const nextPageFirstQuestion = (currentPage + 1) * questionsPerPage;
      setCurrentQuestionIndex(nextPageFirstQuestion);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      const prevPageFirstQuestion = (currentPage - 1) * questionsPerPage;
      setCurrentQuestionIndex(prevPageFirstQuestion);
    }
  };

  // Calculate final score
  const calculateScore = React.useCallback(() => {
    const correct = questions.reduce((acc, question) => {
      return answers[question.id] === question.correct ? acc + 1 : acc;
    }, 0);
    
    setCorrectAnswers(correct);
    return questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
  }, [questions, answers]);

  // Save progress to backend
  const saveProgress = React.useCallback(async (completed = false) => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      const user = JSON.parse(userStr);
      const currentScore = completed ? calculateScore() : 0;

      const progressData = {
        userId: user.id,
        topicId: parseInt(topicId),
        savedAnswers: answers,
        completed,
        score: currentScore,
        timeSpent: 3600 - timeLeft,
        date: new Date().toISOString()
      };

      await api.post('/progress', progressData);
      
      if (completed) {
        setScore(currentScore);
        setQuizSubmitted(true);
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        console.warn('Network error - progress not saved');
        // Continue silently for auto-save, show alert for manual submit
        if (completed) {
          alert('Không thể lưu kết quả. Vui lòng kiểm tra kết nối mạng.');
        }
      }
    }
  }, [answers, timeLeft, topicId, calculateScore]);

  // Submit quiz
  const handleSubmitQuiz = React.useCallback(async (autoSubmit = false) => {
    if (!autoSubmit) {
      const confirmSubmit = window.confirm('Bạn có chắc chắn muốn nộp bài không?');
      if (!confirmSubmit) return;
    }

    await saveProgress(true);
  }, [saveProgress]);

  // Start quiz
  const startQuiz = () => {
    setQuizStarted(true);
  };

  // Restart quiz
  const restartQuiz = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setTimeLeft(3600);
    setQuizSubmitted(false);
    setQuizStarted(true);
    setScore(0);
    setCorrectAnswers(0);
  };

  // Go to next topic
  const goToNextTopic = () => {
    const nextTopicId = parseInt(topicId) + 1;
    navigate(`/quiz/${nextTopicId}`);
  };

  // Return to home
  const goToHome = () => {
    navigate('/home');
  };

  const retryLoad = () => {
    setError(null);
    setLoading(true);
    // Reload the component
    window.location.reload();
  };

  if (error) {
    return <ErrorBoundary error={error} retry={retryLoad} />;
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
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
        <Button variant="primary" onClick={goToHome}>
          <i className="bi bi-house me-2"></i>
          Quay về trang chủ
        </Button>
      </Alert>
    );
  }

  // Quiz completion view
  if (quizSubmitted) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <Card className="shadow-lg">
              <Card.Header className="bg-success text-white text-center">
                <h3>
                  <i className="bi bi-check-circle me-2"></i>
                  Hoàn thành bài quiz
                </h3>
              </Card.Header>
              <Card.Body className="text-center p-5">
                <div className="mb-4">
                  <h1 className={`display-4 ${score >= 80 ? 'text-success' : 'text-warning'}`}>
                    {score}%
                  </h1>
                  <p className="lead">
                    Bạn đã trả lời đúng {correctAnswers}/{questions.length} câu hỏi
                  </p>
                </div>
                
                <div className="row justify-content-center mb-4">
                  <div className="col-md-8">
                    <ProgressBar 
                      now={score} 
                      variant={score >= 80 ? 'success' : 'warning'}
                      className="mb-3"
                      style={{ height: '1rem' }}
                    />
                    <Badge 
                      bg={score >= 80 ? 'success' : 'warning'} 
                      className="fs-6 p-2"
                    >
                      {score >= 80 ? 'Đạt yêu cầu' : 'Chưa đạt yêu cầu'}
                    </Badge>
                  </div>
                </div>

                <div className="d-flex flex-wrap justify-content-center gap-3">
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={goToHome}
                  >
                    <i className="bi bi-house me-2"></i>
                    Về trang chủ
                  </Button>
                  
                  <Button 
                    variant="outline-secondary" 
                    size="lg"
                    onClick={restartQuiz}
                  >
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Làm lại
                  </Button>
                  
                  {score >= 80 && (
                    <Button 
                      variant="success" 
                      size="lg"
                      onClick={goToNextTopic}
                    >
                      <i className="bi bi-arrow-right me-2"></i>
                      Chuyên đề tiếp theo
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Quiz start screen
  if (!quizStarted) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <Card className="shadow-lg">
              <Card.Header className="bg-primary text-white text-center">
                <h3>
                  <i className="bi bi-play-circle me-2"></i>
                  Bắt đầu bài quiz
                </h3>
              </Card.Header>
              <Card.Body className="text-center p-5">
                <h4 className="mb-4">{topicData?.title || `Chuyên đề ${topicId}`}</h4>
                
                <div className="row mb-4">
                  <div className="col-md-4">
                    <Card className="border-primary">
                      <Card.Body>
                        <h5 className="text-primary">
                          <i className="bi bi-question-circle me-2"></i>
                          {questions.length}
                        </h5>
                        <p className="mb-0">Câu hỏi</p>
                      </Card.Body>
                    </Card>
                  </div>
                  <div className="col-md-4">
                    <Card className="border-success">
                      <Card.Body>
                        <h5 className="text-success">
                          <i className="bi bi-clock me-2"></i>
                          60 phút
                        </h5>
                        <p className="mb-0">Thời gian</p>
                      </Card.Body>
                    </Card>
                  </div>
                  <div className="col-md-4">
                    <Card className="border-info">
                      <Card.Body>
                        <h5 className="text-info">
                          <i className="bi bi-trophy me-2"></i>
                          80%
                        </h5>
                        <p className="mb-0">Điểm đạt</p>
                      </Card.Body>
                    </Card>
                  </div>
                </div>

                {existingProgress && !existingProgress.completed && (
                  <Alert variant="info" className="mb-4">
                    <i className="bi bi-info-circle me-2"></i>
                    Bạn có bài làm đã lưu. Tiếp tục từ lần trước?
                  </Alert>
                )}

                <div className="d-flex justify-content-center gap-3">
                  <Button 
                    variant="outline-secondary" 
                    size="lg"
                    onClick={goToHome}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Quay lại
                  </Button>
                  
                  <Button 
                    variant="success" 
                    size="lg"
                    onClick={startQuiz}
                  >
                    <i className="bi bi-play me-2"></i>
                    {existingProgress && !existingProgress.completed ? 'Tiếp tục làm bài' : 'Bắt đầu'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="quiz-interface">
      <div className="container-fluid h-100">
        <div className="row h-100">
          {/* Left sidebar - Question navigation */}
          <div className="col-lg-3 bg-light border-end quiz-sidebar">
            <div className="p-3">
              <h5 className="text-primary mb-3">
                <i className="bi bi-list-ol me-2"></i>
                Danh sách câu hỏi
              </h5>
              
              <div className="question-grid mb-3">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    className={`question-nav-btn ${
                      index === currentQuestionIndex ? 'active' : ''
                    } ${answers[questions[index].id] !== undefined ? 'answered' : ''}`}
                    onClick={() => goToQuestion(index)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className="pagination-controls mb-3">
                <small className="text-muted d-block mb-2">
                  Trang {currentPage + 1}/{totalPages} ({questionsPerPage} câu/trang)
                </small>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={currentPage === 0}
                  >
                    <i className="bi bi-chevron-left"></i> Trước
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages - 1}
                  >
                    Tiếp <i className="bi bi-chevron-right"></i>
                  </Button>
                </div>
              </div>

              <div className="progress-summary">
                <small className="text-muted">Tiến độ làm bài:</small>
                <div className="d-flex justify-content-between text-dark mt-2">
                  <span className="fw-bold">{Object.keys(answers).length}/{questions.length} câu</span>
                  <span className="fw-bold">
                    {questions.length > 0 ? Math.round((Object.keys(answers).length / questions.length) * 100) : 0}%
                  </span>
                </div>
                <ProgressBar 
                  now={questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0}
                  variant="primary"
                  className="mt-2"
                  style={{ height: '0.5rem' }}
                />
              </div>
            </div>
          </div>

          {/* Center - Current question */}
          <div className="col-lg-6 quiz-content">
            <div className="p-4">
              <Card className="shadow-sm h-100">
                <Card.Header className="bg-primary text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      Câu {currentQuestionIndex + 1}/{questions.length}
                    </h5>
                    <Badge bg="light" text="dark">
                      Trang {currentPage + 1}/{totalPages}
                    </Badge>
                  </div>
                </Card.Header>
                
                <Card.Body className="flex-grow-1 d-flex flex-column">
                  <h4 className="mb-4">{currentQuestion.title}</h4>
                  
                  <Form className="flex-grow-1">
                    {currentQuestion.choices.map((choice, index) => (
                      <Form.Check
                        key={index}
                        type="radio"
                        id={`q_${currentQuestion.id}_${index}`}
                        name={`q_${currentQuestion.id}`}
                        className="mb-3 p-3 border rounded choice-option"
                        checked={answers[currentQuestion.id] === index}
                        onChange={() => handleAnswerSelect(currentQuestion.id, index)}
                        label={
                          <span className="ms-2">
                            <strong className="text-primary me-2">
                              {String.fromCharCode(65 + index)}.
                            </strong>
                            {choice}
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
                      onClick={() => goToQuestion(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Câu trước
                    </Button>
                    
                    <Button
                      variant="primary"
                      onClick={() => goToQuestion(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                      disabled={currentQuestionIndex === questions.length - 1}
                    >
                      Câu tiếp
                      <i className="bi bi-arrow-right ms-2"></i>
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </div>
          </div>

          {/* Right sidebar - Timer and controls */}
          <div className="col-lg-3 bg-light border-start quiz-sidebar">
            <div className="p-3">
              <Card className="shadow-sm mb-3">
                <Card.Header className="bg-warning text-dark">
                  <h6 className="mb-0">
                    <i className="bi bi-clock me-2"></i>
                    Thời gian còn lại
                  </h6>
                </Card.Header>
                <Card.Body className="text-center">
                  <h3 className={`mb-0 ${timeLeft < 300 ? 'text-danger' : 'text-primary'}`}>
                    {formatTime(timeLeft)}
                  </h3>
                  {timeLeft < 300 && (
                    <small className="text-danger">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      Sắp hết thời gian!
                    </small>
                  )}
                </Card.Body>
              </Card>

              <Card className="shadow-sm mb-3">
                <Card.Header>
                  <h6 className="mb-0">
                    <i className="bi bi-graph-up me-2"></i>
                    Thống kê
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div className="mb-2">
                    <small className="text-muted">Đã làm:</small>
                    <div className="fw-bold text-dark">{Object.keys(answers).length}/{questions.length} câu</div>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">Còn lại:</small>
                    <div className="fw-bold text-secondary">{questions.length - Object.keys(answers).length} câu</div>
                  </div>
                  <div>
                    <small className="text-muted">Thời gian đã dùng:</small>
                    <div className="fw-bold text-info">{formatTime(3600 - timeLeft)}</div>
                  </div>
                </Card.Body>
              </Card>

              <div className="d-grid gap-2">
                <Button
                  variant="success"
                  size="lg"
                  onClick={() => handleSubmitQuiz(false)}
                  disabled={Object.keys(answers).length === 0}
                >
                  <i className="bi bi-check2-circle me-2"></i>
                  Nộp bài
                </Button>
                
                <Button
                  variant="outline-danger"
                  onClick={goToHome}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Thoát
                </Button>
              </div>

              <div className="mt-3 p-3 bg-light border rounded">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-2"></i>
                  Bài làm được tự động lưu mỗi 30 giây
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizInterface;
