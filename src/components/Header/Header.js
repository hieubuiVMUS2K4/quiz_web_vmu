import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeSwitcher from '../ThemeSwitcher';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <i className="bi bi-book me-2"></i>
          Vimaru Quiz
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Link to="/" className='nav-link'>
              <i className="bi bi-house me-1"></i>
              Trang chủ
            </Link>
            {user?.role === 'admin' && (
              <>
                <Link to="/admin/dashboard" className='nav-link'>
                  <i className="bi bi-graph-up me-1"></i>
                  Thống kê
                </Link>
                <Link to="/admin/users" className='nav-link'>
                  <i className="bi bi-people me-1"></i>
                  Quản lý sinh viên
                </Link>
              </>
            )}
          </Nav>
          <Nav>
            <ThemeSwitcher />
            <NavDropdown 
              title={
                <span>
                  <i className="bi bi-person-circle me-1"></i>
                  {user?.name || 'Tài khoản'}
                </span>
              } 
              id="basic-nav-dropdown"
            >
              <NavDropdown.Item as={Link} to="/profile">
                <i className="bi bi-person me-2"></i>
                Thông tin cá nhân
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Đăng xuất
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;