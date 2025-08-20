import React from 'react';
import { useSelector } from 'react-redux';
import { Container, Table } from 'react-bootstrap';

const ResultsPage = () => {
  const progress = useSelector(s => s.quiz.progress);

  return (
    <Container className="py-4">
      <h4>Kết quả</h4>
      <Table striped hover>
        <thead>
          <tr>
            <th>Chuyên đề</th>
            <th>Ngày</th>
            <th>Số câu đúng</th>
            <th>Tổng</th>
            <th>Điểm</th>
          </tr>
        </thead>
        <tbody>
          {progress.map((p) => {
            const total = p.totalQuestions || 1;
            const correct = typeof p.correctAnswers === 'number' ? p.correctAnswers : 0;
            const pct = total ? ((correct / total) * 100).toFixed(1) : '0.0';
            return (
              <tr key={p.id}>
                <td>{p.topicTitle}</td>
                <td>{p.timestamp ? new Date(p.timestamp).toLocaleString() : '—'}</td>
                <td>{correct}</td>
                <td>{total}</td>
                <td>{pct}%</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
};

export default ResultsPage;
