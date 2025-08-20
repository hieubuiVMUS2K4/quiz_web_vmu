import axios from 'axios';

const API_URL = 'http://localhost:3001';

export const authService = {
    login: async (email, password) => {
        const response = await axios.get(`${API_URL}/users?email=${email}`);
        const users = response.data;
        
        if (users.length === 0) {
            throw new Error('Người dùng không tồn tại');
        }

        const user = users[0];
        if (user.password !== password) {
            throw new Error('Mật khẩu không đúng');
        }

        // Remove password from user object before storing
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    logout: () => {
        localStorage.removeItem('user');
    }
};
