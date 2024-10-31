// src/components/DocumentStats.js
import React from 'react';

const DocumentStats = ({ stats }) => (
  <div className="document-stats">
    <h3>Data Scrubbing Summary</h3>
    <ul>
      {Object.entries(stats).map(([type, count]) => (
        <li key={type}>{type}: {count}</li>
      ))}
    </ul>
  </div>
);

export default DocumentStats;
