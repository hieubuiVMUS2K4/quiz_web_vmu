import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import api from '../services/api';

const ForgotPasswordModal = ({ show, onHide }) => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập mã OTP, 3: nhập mật khẩu mới
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const resetModal = () => {
    setEmail('');
    setOtpCode('');
    setNewPassword('');
    setConfirmPassword('');
    setStep(1);
    setError('');
    setSuccess('');
    setGeneratedOtp('');
  };

  const handleClose = () => {
    resetModal();
    onHide();
  };

  // Bước 1: Gửi OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Kiểm tra email có tồn tại không
      const response = await api.get(`/users?email=${email}`);
      const users = response.data;
      
      if (users.length === 0) {
        setError('Email không tồn tại trong hệ thống');
        setLoading(false);
        return;
      }

      // Tạo OTP giả lập (trong thực tế sẽ gửi qua email)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      
      // Hiển thị thông báo thành công
      setSuccess(`Mã OTP đã được gửi đến email ${email}. Mã OTP của bạn là: ${otp}`);
      setStep(2);
    } catch (err) {
      setError('Không thể gửi mã OTP. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác thực OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');

    if (otpCode !== generatedOtp) {
      setError('Mã OTP không đúng. Vui lòng kiểm tra lại.');
      return;
    }

    setSuccess('Mã OTP đúng! Vui lòng nhập mật khẩu mới.');
    setStep(3);
  };

  // Bước 3: Đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    try {
      // Lấy thông tin user
      const response = await api.get(`/users?email=${email}`);
      const user = response.data[0];

      // Cập nhật mật khẩu
      await api.put(`/users/${user.id}`, {
        ...user,
        password: newPassword
      });

      setSuccess('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.');
      
      // Tự động đóng modal sau 2 giây
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError('Không thể cập nhật mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Form onSubmit={handleSendOtp}>
      <Form.Group className="mb-3">
        <Form.Label>Email đăng ký</Form.Label>
        <Form.Control
          type="email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <Form.Text className="text-muted">
          Chúng tôi sẽ gửi mã OTP đến email này để xác thực.
        </Form.Text>
      </Form.Group>
    </Form>
  );

  const renderStep2 = () => (
    <Form onSubmit={handleVerifyOtp}>
      <Form.Group className="mb-3">
        <Form.Label>Mã OTP</Form.Label>
        <Form.Control
          type="text"
          placeholder="Nhập mã OTP 6 số"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
          required
          maxLength={6}
        />
        <Form.Text className="text-muted">
          Mã OTP đã được gửi đến {email}
        </Form.Text>
      </Form.Group>
    </Form>
  );

  const renderStep3 = () => (
    <Form onSubmit={handleResetPassword}>
      <Form.Group className="mb-3">
        <Form.Label>Mật khẩu mới</Form.Label>
        <Form.Control
          type="password"
          placeholder="Nhập mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
          disabled={loading}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Xác nhận mật khẩu mới</Form.Label>
        <Form.Control
          type="password"
          placeholder="Nhập lại mật khẩu mới"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          disabled={loading}
        />
      </Form.Group>
    </Form>
  );

  const getStepTitle = () => {
    switch(step) {
      case 1: return 'Quên mật khẩu';
      case 2: return 'Xác thực OTP';
      case 3: return 'Đặt lại mật khẩu';
      default: return 'Quên mật khẩu';
    }
  };

  const getSubmitButton = () => {
    switch(step) {
      case 1: 
        return (
          <Button variant="primary" type="submit" disabled={loading} onClick={handleSendOtp}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang gửi...
              </>
            ) : (
              'Gửi mã OTP'
            )}
          </Button>
        );
      case 2:
        return (
          <Button variant="primary" type="submit" onClick={handleVerifyOtp}>
            Xác thực OTP
          </Button>
        );
      case 3:
        return (
          <Button variant="primary" type="submit" disabled={loading} onClick={handleResetPassword}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang cập nhật...
              </>
            ) : (
              'Đặt lại mật khẩu'
            )}
          </Button>
        );
      default: return null;
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-key me-2"></i>
          {getStepTitle()}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {/* Progress indicator */}
        <div className="mb-4">
          <div className="d-flex justify-content-between">
            <small className={`text-${step >= 1 ? 'primary' : 'muted'}`}>
              <i className={`bi bi-${step >= 1 ? 'check-circle-fill' : 'circle'} me-1`}></i>
              Nhập email
            </small>
            <small className={`text-${step >= 2 ? 'primary' : 'muted'}`}>
              <i className={`bi bi-${step >= 2 ? 'check-circle-fill' : 'circle'} me-1`}></i>
              Xác thực OTP
            </small>
            <small className={`text-${step >= 3 ? 'primary' : 'muted'}`}>
              <i className={`bi bi-${step >= 3 ? 'check-circle-fill' : 'circle'} me-1`}></i>
              Đặt lại mật khẩu
            </small>
          </div>
          <div className="progress mt-2" style={{ height: '4px' }}>
            <div 
              className="progress-bar" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Hủy
        </Button>
        {getSubmitButton()}
      </Modal.Footer>
    </Modal>
  );
};

export default ForgotPasswordModal;
