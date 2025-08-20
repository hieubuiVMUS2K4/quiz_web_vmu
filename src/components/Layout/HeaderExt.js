import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const HeaderExt = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar expand="lg" className="bg-primary navbar-dark shadow-sm" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1050 }}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <i className="bi bi-mortarboard-fill me-2"></i>
          Vimaru Quiz
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Link to="/home" className='nav-link'>
              <i className="bi bi-house-door me-1"></i> Home
            </Link>
            {user && user.role === 'user' && (
              <Link to="/progress" className='nav-link'>
                <i className="bi bi-graph-up-arrow me-1"></i> Tiến trình
              </Link>
            )}
            {user?.role === 'admin' && (
              <>
                <Link to="/users" className='nav-link'>
                  <i className="bi bi-people me-1"></i> Users
                </Link>
                <Link to="/admin" className='nav-link'>
                  <i className="bi bi-bar-chart me-1"></i> Thống kê
                </Link>
              </>
            )}
          </Nav>
          <Nav>
            {user ? (
              <NavDropdown 
                title={<><i className="bi bi-person-circle me-1"></i>{user.email}</>} 
                id="user-dropdown"
                className="bg-primary-subtle rounded"
              >
                <NavDropdown.Item onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Log out
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Link to="/login" className='nav-link btn btn-outline-light ms-2'>
                <i className="bi bi-box-arrow-in-right me-1"></i>
                Log in
              </Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default HeaderExt;
