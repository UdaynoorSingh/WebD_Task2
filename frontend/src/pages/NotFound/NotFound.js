import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="container">
        <div className="not-found-content">
          <div className="not-found-icon">🔍</div>
          <h1>Page Not Found</h1>
          <p>Sorry, we couldn't find the page you're looking for.</p>
          <div className="not-found-actions">
            <Link to="/" className="btn btn-primary">
              Go Home
            </Link>
            <Link to="/marketplace" className="btn btn-secondary">
              Browse Marketplace
            </Link>
          </div>
          <div className="not-found-help">
            <p>Need help? <a href="/contact">Contact support</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;