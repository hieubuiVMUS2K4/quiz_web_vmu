import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';

const ResultTable = ({ data = [] }) => {
  const exportCSV = () => {
    if (!data || !data.length) return;
    const headers = ['Tên sinh viên','Email','Chuyên đề hoàn thành','Kết quả'];
    const rows = data.map(r => [
      r.name, 
      r.email, 
      `${r.completedTopics}/${r.totalTopics}`, 
      r.status
    ]);
    const csv = [headers, ...rows].map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student-results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="d-flex justify-content-end mb-2">
        <Button onClick={exportCSV} size="sm">Export CSV</Button>
      </div>
      <Table striped hover responsive>
        <thead>
          <tr>
            <th>Tên sinh viên</th>
            <th>Email</th>
            <th className="text-center">Chuyên đề hoàn thành</th>
            <th className="text-center">Kết quả</th>
          </tr>
        </thead>
        <tbody>
          {data.map((student, i) => (
            <tr key={student.id || i}>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td className="text-center">
                <span className={student.completedTopics === student.totalTopics ? 'text-success' : 'text-warning'}>
                  {student.completedTopics}/{student.totalTopics}
                </span>
              </td>
              <td className="text-center">
                <Badge bg={student.isCompleted ? 'success' : 'danger'}>
                  {student.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ResultTable;
