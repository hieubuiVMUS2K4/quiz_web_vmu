// Test script để kiểm tra API calls
const axios = require('axios');

const baseURL = 'http://localhost:3002';

async function testAPIs() {
  try {
    console.log('Testing departments API...');
    const depsRes = await axios.get(`${baseURL}/departments`);
    console.log('Departments:', depsRes.data);
    
    console.log('\nTesting users API with role filter...');
    const usersRes = await axios.get(`${baseURL}/users?role=user`);
    console.log('Users (role=user):', usersRes.data);
    
    console.log('\nTesting progress API...');
    const progressRes = await axios.get(`${baseURL}/progress`);
    console.log('Progress:', progressRes.data);
    
    console.log('\n=== STATS CALCULATION ===');
    const departments = depsRes.data;
    const users = usersRes.data;
    const progress = progressRes.data;
    
    console.log(`Total students: ${users.length}`);
    
    // Calculate passed students
    const passedStudents = new Set(
      progress
        .filter(p => (p.correctAnswers / p.totalQuestions) * 100 >= 80)
        .map(p => p.userId)
    ).size;
    
    console.log(`Passed students: ${passedStudents}`);
    
    // Department stats
    departments.forEach(dept => {
      const deptUsers = users.filter(u => u.departmentId === dept.id);
      const deptProgress = progress.filter(p => 
        deptUsers.some(u => u.id === p.userId)
      );

      const totalStudents = deptUsers.length;
      const deptPassedStudents = new Set(
        deptProgress
          .filter(p => (p.correctAnswers / p.totalQuestions) * 100 >= 80)
          .map(p => p.userId)
      ).size;

      const completionRate = totalStudents > 0 
        ? (deptPassedStudents / totalStudents * 100).toFixed(1)
        : 0;

      console.log(`\n${dept.name}:`);
      console.log(`  - Users in dept: ${deptUsers.length}`);
      console.log(`  - Progress records: ${deptProgress.length}`);
      console.log(`  - Passed: ${deptPassedStudents}`);
      console.log(`  - Rate: ${completionRate}%`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPIs();
