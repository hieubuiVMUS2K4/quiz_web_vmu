import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ListGroup } from 'react-bootstrap';

const Sidebar = ({ topics = [] }) => {
  const { topicId } = useParams();

  return (
    <div className="bg-light border-end h-100" style={{ width: 250, minHeight: '90vh' }}>
      <div className="p-3">
        <h5 className="mb-3 text-primary">
          <i className="bi bi-book me-2"></i>
          Chuyên đề
        </h5>
        <ListGroup variant="flush">
          {topics.map((t) => (
            <ListGroup.Item 
              key={t.id}
              action
              active={topicId === t.id.toString()}
              as={Link}
              to={`/quiz/${t.id}`}
              className="d-flex align-items-center border-0 rounded-2 mb-1"
            >
              <i className="bi bi-journal-text me-2"></i>
              {t.title}
              {topicId === t.id.toString() && (
                <i className="bi bi-arrow-right-short ms-auto"></i>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    </div>
  );
};

export default Sidebar;
