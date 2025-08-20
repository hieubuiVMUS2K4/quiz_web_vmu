import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import api from '../../../services/api';
import ResultTable from '../ResultTable';

const AdminDashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState([]);
  const [filterDept, setFilterDept] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [depsRes, usersRes, topicsRes, progressRes] = await Promise.all([
          api.get('/departments'),
          api.get('/users?role=user'),
          api.get('/topics'),
          api.get('/progress')
        ]);
        setDepartments(depsRes.data);
        setUsers(usersRes.data);
        setTopics(topicsRes.data);
        setProgress(progressRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Kiểm tra xem sinh viên có hoàn thành hết chương trình không
  const isStudentCompleted = (userId) => {
    if (!progress.length || !topics.length) return false;
    
    // Lấy tất cả progress của sinh viên này
    const userProgress = progress.filter(p => p.userId === userId);
    
    // Kiểm tra xem đã làm đủ topics.length chuyên đề chưa
    const completedTopics = new Set();
    userProgress.forEach(p => {
      // Chỉ tính những chuyên đề đạt >= 80%
      if ((p.correctAnswers / p.totalQuestions) * 100 >= 80) {
        completedTopics.add(p.topicId);
      }
    });
    
    // Phải hoàn thành đủ topics.length chuyên đề và mỗi chuyên đề phải >= 80%
    return completedTopics.size >= topics.length;
  };

  const calculateDepartmentStats = () => {
    if (!departments.length || !users.length) return [];
    
    return departments.map(dept => {
      const deptUsers = users.filter(u => u.departmentId === dept.id);
      
      const totalStudents = deptUsers.length;
      const passedStudents = deptUsers.filter(user => isStudentCompleted(user.id)).length;

      const completionRate = totalStudents > 0 
        ? (passedStudents / totalStudents * 100).toFixed(1)
        : 0;

      return {
        name: dept.name,
        totalStudents,
        passedStudents,
        completionRate
      };
    });
  };

  // Tạo dữ liệu tổng kết cho từng sinh viên
  const getStudentResults = () => {
    if (!users.length || !topics.length) return [];
    
    const filteredUsers = filterDept 
      ? users.filter(u => u.departmentId === Number(filterDept))
      : users;

    return filteredUsers.map(user => {
      const isCompleted = isStudentCompleted(user.id);
      const userTopics = progress.filter(p => p.userId === user.id);
      const completedTopics = userTopics.filter(p => (p.correctAnswers / p.totalQuestions) * 100 >= 80).length;
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        departmentId: user.departmentId,
        completedTopics: completedTopics,
        totalTopics: topics.length,
        status: isCompleted ? 'Đạt' : 'Không đạt',
        isCompleted: isCompleted
      };
    });
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

  const departmentStats = calculateDepartmentStats();
  const totalStudents = users.length;
  const passedStudents = users.filter(user => isStudentCompleted(user.id)).length;
  const studentResults = getStudentResults();

  return (
    <Container fluid className="py-4">
      <h4 className="mb-4">
        <i className="bi bi-graph-up me-2"></i>
        Thống kê tổng quan
      </h4>

      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <h6 style={{ color: 'var(--text)', opacity: 0.7 }} className="mb-2">Tổng số sinh viên</h6>
              <h3>{totalStudents}</h3>
              <div className="text-success">
                <i className="bi bi-people-fill me-1"></i>
                Đã đăng ký tài khoản
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <h6 style={{ color: 'var(--text)', opacity: 0.7 }} className="mb-2">Sinh viên đã hoàn thành</h6>
              <h3>{passedStudents}</h3>
              <div className="text-primary">
                <i className="bi bi-check-circle-fill me-1"></i>
                Hoàn thành đủ {topics.length} chuyên đề (≥80%)
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <h6 style={{ color: 'var(--text)', opacity: 0.7 }} className="mb-2">Tỷ lệ hoàn thành</h6>
              <h3>{totalStudents ? ((passedStudents / totalStudents) * 100).toFixed(1) : '0.0'}%</h3>
              <div className="text-info">
                <i className="bi bi-graph-up-arrow me-1"></i>
                Trên tổng số sinh viên
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <h5 className="mb-4">Thống kê theo khoa</h5>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Khoa</th>
                      <th className="text-center">Tổng SV</th>
                      <th className="text-center">SV đạt</th>
                      <th className="text-center">Tỷ lệ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentStats.map((d) => (
                      <tr key={d.name}>
                        <td>{d.name}</td>
                        <td className="text-center">{d.totalStudents}</td>
                        <td className="text-center">{d.passedStudents}</td>
                        <td className="text-center">{d.completionRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={4} className="mb-3">
          <Card>
            <Card.Body>
              <h5 className="mb-3">Bộ lọc</h5>
              <Form.Group className="mb-2">
                <Form.Label>Khoa</Form.Label>
                <Form.Select value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                  <option value="">Tất cả</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card>
            <Card.Body>
              <h5 className="mb-3">Danh sách kết quả</h5>
              <ResultTable data={studentResults} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
