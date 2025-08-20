// Test script cho logic mới
const axios = require('axios');

const baseURL = 'http://localhost:3002';

async function testNewLogic() {
  try {
    const [depsRes, usersRes, topicsRes, progressRes] = await Promise.all([
      axios.get(`${baseURL}/departments`),
      axios.get(`${baseURL}/users?role=user`),
      axios.get(`${baseURL}/topics`),
      axios.get(`${baseURL}/progress`)
    ]);
    
    const departments = depsRes.data;
    const users = usersRes.data;
    const topics = topicsRes.data;
    const progress = progressRes.data;
    
    console.log(`=== THÔNG TIN CƠ BẢN ===`);
    console.log(`Tổng số chuyên đề: ${topics.length}`);
    console.log(`Tổng số sinh viên: ${users.length}`);
    console.log(`Tổng số kết quả làm bài: ${progress.length}`);
    
    // Logic kiểm tra sinh viên hoàn thành
    const isStudentCompleted = (userId) => {
      const userProgress = progress.filter(p => p.userId === userId);
      
      const completedTopics = new Set();
      userProgress.forEach(p => {
        if ((p.correctAnswers / p.totalQuestions) * 100 >= 80) {
          completedTopics.add(p.topicId);
        }
      });
      
      // Phải hoàn thành đủ 9 chuyên đề
      return completedTopics.size >= 9;
    };
    
    console.log(`\n=== PHÂN TÍCH TỪNG SINH VIÊN ===`);
    users.forEach(user => {
      const userProgress = progress.filter(p => p.userId === user.id);
      const completedTopics = new Set();
      const topicDetails = [];
      
      userProgress.forEach(p => {
        const score = (p.correctAnswers / p.totalQuestions) * 100;
        const passed = score >= 80;
        if (passed) {
          completedTopics.add(p.topicId);
        }
        topicDetails.push(`Chuyên đề ${p.topicId}: ${score.toFixed(1)}% (${passed ? 'ĐẠT' : 'KHÔNG ĐẠT'})`);
      });
      
      const isCompleted = isStudentCompleted(user.id);
      
      console.log(`\n${user.name} (${user.email}):`);
      console.log(`  - Đã làm ${userProgress.length} chuyên đề`);
      console.log(`  - Đạt ${completedTopics.size} chuyên đề`);
      topicDetails.forEach(detail => console.log(`  - ${detail}`));
      console.log(`  - KẾT QUẢ CUỐI: ${isCompleted ? 'ĐẠT' : 'KHÔNG ĐẠT'} (cần 9 chuyên đề đạt ≥80%)`);
    });
    
    console.log(`\n=== THỐNG KÊ TỔNG ===`);
    const passedStudents = users.filter(user => isStudentCompleted(user.id)).length;
    console.log(`Sinh viên đạt: ${passedStudents}/${users.length} (${((passedStudents/users.length)*100).toFixed(1)}%)`);
    
    console.log(`\n=== THỐNG KÊ THEO KHOA ===`);
    departments.forEach(dept => {
      const deptUsers = users.filter(u => u.departmentId === dept.id);
      const deptPassed = deptUsers.filter(user => isStudentCompleted(user.id)).length;
      const rate = deptUsers.length > 0 ? (deptPassed / deptUsers.length * 100).toFixed(1) : 0;
      
      console.log(`${dept.name}: ${deptPassed}/${deptUsers.length} đạt (${rate}%)`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testNewLogic();
