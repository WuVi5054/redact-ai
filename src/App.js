import React, { useState } from 'react';
import UploadDocument from './components/UploadDocument';
import DocumentViewer from './components/DocumentViewer';
import DocumentStats from './components/DocumentStats';
import DocumentControls from './components/DocumentControls';
import './App.css';

function App() {
  const [documents, setDocuments] = useState([]); // Array to store multiple documents
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const addDocument = (original, sanitized, stats) => {
    setDocuments([...documents, { original, sanitized, stats }]);
  };

  const currentDoc = documents[currentIndex] || {}; // Get the current document

  return (
    <div className="app">
      <h1>RedactAI</h1>
      <UploadDocument 
        addDocument={addDocument} 
        setLoading={setLoading} 
      />
      {loading && <div className="loading-spinner">Processing...</div>}
      
      {currentDoc.original && currentDoc.sanitized && (
        <DocumentViewer originalDoc={currentDoc.original} sanitizedDoc={currentDoc.sanitized} />
      )}
      {currentDoc.stats && <DocumentStats stats={currentDoc.stats} />}
      <DocumentControls sanitizedDoc={currentDoc.sanitized}/>

      {/* Pagination Controls */}
      <div className="pagination-controls">
        <button onClick={() => setCurrentIndex((currentIndex - 1 + documents.length) % documents.length)} disabled={documents.length <= 1}>
          Previous
        </button>
        <button onClick={() => setCurrentIndex((currentIndex + 1) % documents.length)} disabled={documents.length <= 1}>
          Next
        </button>
        <button onClick={() => setCurrentIndex(documents.length - 1)} disabled={documents.length <= 1}>
          Latest
        </button>
      </div>
    </div>
  );
}

export default App;