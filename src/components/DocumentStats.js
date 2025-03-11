// src/components/DocumentStats.js
import React from 'react';

const DocumentStats = ({ stats }) => {
  // Calculate total entities redacted
  const totalRedacted = Object.values(stats).reduce((sum, count) => sum + count, 0);
  
  return (
    <div className="document-stats">
      <h3>Data Scrubbing Summary</h3>
      <div className="stats-total">
        <span className="stats-total-number">{totalRedacted}</span>
        <span className="stats-total-label">Total Entities Redacted</span>
      </div>
      <ul>
        {Object.entries(stats).map(([type, count]) => (
          <li key={type}>
            <span className="stats-type">{type}</span>
            <span className="stats-count">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentStats;
