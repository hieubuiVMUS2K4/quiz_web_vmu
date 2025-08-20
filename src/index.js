import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import AdminPage from './pages/AdminPage';
import UsersPage from './pages/UsersPage';
import ProgressPage from './pages/ProgressPage';
import LayoutPage from './pages/LayoutPage';
import ProtectedRoute from './components/ProtectedRoute';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import store from './redux/store';

// Import styles in correct order
import './styles/tokens.css';
import './styles/theme-transitions.css';
import './styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter,
  Routes, 
  Route 
 } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<LoginPage/>} />

          <Route path="/home" element={
            <ProtectedRoute>
              <LayoutPage><StudentDashboard/></LayoutPage>
            </ProtectedRoute>
          } />
          <Route path="/quiz/:topicId" element={
            <ProtectedRoute>
              <QuizPage/>
            </ProtectedRoute>
          } />
          <Route path="/quiz" element={
            <ProtectedRoute>
              <LayoutPage><StudentDashboard/></LayoutPage>
            </ProtectedRoute>
          } />
          <Route path="/results" element={
            <ProtectedRoute>
              <LayoutPage><ResultsPage/></LayoutPage>
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <LayoutPage><UsersPage/></LayoutPage>
            </ProtectedRoute>
          } />
          <Route path="/progress" element={
            <ProtectedRoute>
              <LayoutPage><ProgressPage/></LayoutPage>
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <LayoutPage><AdminPage/></LayoutPage>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
