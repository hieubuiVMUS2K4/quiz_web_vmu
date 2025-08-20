import React from 'react';
import { Alert, Button } from 'react-bootstrap';

const ErrorBoundary = ({ error, retry }) => {
  if (!error) return null;

  const isNetworkError = error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED';

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Alert variant="danger" className="text-center">
            <Alert.Heading>
              <i className="bi bi-exclamation-triangle me-2"></i>
              {isNetworkError ? 'Lỗi kết nối' : 'Có lỗi xảy ra'}
            </Alert.Heading>
            <p>
              {isNetworkError 
                ? 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và đảm bảo máy chủ đang chạy.'
                : 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.'
              }
            </p>
            <hr />
            <div className="d-flex justify-content-center gap-3">
              <Button variant="outline-danger" onClick={retry}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Thử lại
              </Button>
              <Button variant="danger" onClick={() => window.location.reload()}>
                <i className="bi bi-bootstrap-reboot me-2"></i>
                Tải lại trang
              </Button>
            </div>
            {isNetworkError && (
              <div className="mt-3">
                <small className="text-muted">
                  <strong>Hướng dẫn:</strong> Đảm bảo JSON Server đang chạy trên port 3002
                  <br />
                  Chạy lệnh: <code>npx json-server --watch db.json --port 3002</code>
                </small>
              </div>
            )}
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
