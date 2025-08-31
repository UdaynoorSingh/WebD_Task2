import React, { useState, useEffect } from 'react';
import './PriceHistory.css';

const mockPriceHistory = [
  { date: '2023-10-01', price: 1200 },
  { date: '2023-10-15', price: 1150 },
  { date: '2023-11-01', price: 1099 },
  { date: '2023-11-15', price: 1050 },
  { date: '2023-12-01', price: 999 },
];

const PriceHistory = ({ productId }) => {
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPriceHistory = async () => {
      try {
        setTimeout(() => {
          setPriceHistory(mockPriceHistory);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching price history:', error);
        setLoading(false);
      }
    };

    fetchPriceHistory();
  }, [productId]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="price-history">
        <h3>Price History</h3>
        <div className="loading">Loading price history...</div>
      </div>
    );
  }

  if (priceHistory.length === 0) {
    return (
      <div className="price-history">
        <h3>Price History</h3>
        <p>No price history available for this product.</p>
      </div>
    );
  }

  return (
    <div className="price-history">
      <h3>Price History</h3>
      <div className="price-history-chart">
        <div className="chart-container">
          {priceHistory.map((entry, index) => (
            <div key={index} className="chart-bar">
              <div className="bar-label">{formatPrice(entry.price)}</div>
              <div
                className="bar"
                style={{
                  height: `${((entry.price - priceHistory[priceHistory.length - 1].price) / 
                           (priceHistory[0].price - priceHistory[priceHistory.length - 1].price)) * 100}%`
                }}
              ></div>
              <div className="bar-date">{formatDate(entry.date)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="price-history-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Price</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {priceHistory.map((entry, index) => (
              <tr key={index}>
                <td>{formatDate(entry.date)}</td>
                <td>{formatPrice(entry.price)}</td>
                <td className={index === 0 ? '' : entry.price > priceHistory[index - 1].price ? 'price-up' : 'price-down'}>
                  {index === 0 ? '-' : 
                   entry.price > priceHistory[index - 1].price ? '↗' : 
                   entry.price < priceHistory[index - 1].price ? '↘' : '→'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PriceHistory;