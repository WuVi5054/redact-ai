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

  const scrollToUpload = () => {
    const uploadSection = document.getElementById('upload-section');
    uploadSection.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app">
      <div className="landing-section">
        <h1>Welcome to RedactAI</h1>
        <p className="tagline">Secure Document Sanitization Made Simple</p>
        
        <div className="features-grid">
          <div className="feature-card">
            <h3>Text Extraction</h3>
            <p>Advanced OCR technology to extract text from your documents with high accuracy</p>
          </div>
          <div className="feature-card">
            <h3>PII Detection</h3>
            <p>Automatically detect and protect sensitive personal information</p>
          </div>
          <div className="feature-card">
            <h3>Document Comparison</h3>
            <p>Side-by-side view of original and sanitized documents</p>
          </div>
          <div className="feature-card">
            <h3>Secure Processing</h3>
            <p>Enterprise-grade security for your sensitive documents</p>
          </div>
        </div>

        <button className="try-now-button" onClick={scrollToUpload}>Try Now</button>
      </div>

      <div id="upload-section" className="upload-section">
        <h1>RedactAI</h1>
        <UploadDocument 
          addDocument={addDocument} 
          setLoading={setLoading} 
        />
        {loading && <div className="loading-spinner">Processing...</div>}
        
        {documents.length > 0 && (
          <div className="documents-dashboard">
            <div className="dashboard-header">
              <h2 className="dashboard-title">Processed Documents</h2>
              <div className="dashboard-actions">
                <button 
                  className="action-button primary"
                  onClick={async () => {
                    try {
                      // Create an array to store all file blobs
                      const fileBlobs = [];
                      
                      // Fetch each document individually
                      for (const doc of documents) {
                        const response = await fetch(`http://127.0.0.1:8000/download/${doc.sanitized}`);
                        if (!response.ok) throw new Error(`Failed to download ${doc.sanitized}`);
                        const blob = await response.blob();
                        fileBlobs.push({ name: doc.sanitized, blob });
                      }
                      
                      // Create a FormData object with all files
                      const formData = new FormData();
                      fileBlobs.forEach(file => {
                        formData.append('files', file.blob, file.name);
                      });
                      
                      // Send files to backend for zipping
                      const zipResponse = await fetch('http://127.0.0.1:8000/download_all', {
                        method: 'POST',
                        body: formData
                      });
                      
                      if (!zipResponse.ok) throw new Error('Failed to create zip archive');
                      
                      // Download the zip file
                      const zipBlob = await zipResponse.blob();
                      const url = window.URL.createObjectURL(zipBlob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'sanitized_documents.zip';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error('Error downloading files:', error);
                      alert('Failed to download files. Please try again.');
                    }
                  }}
                >
                  <i className="fas fa-download"></i> Download All
                </button>
                <button
                  className="action-button primary"
                  onClick={async () => {
                    try {
                      // Upload each document to Azure Blob Storage
                      for (const doc of documents) {
                        await fetch(`http://127.0.0.1:8000/upload-to-blob/?filename=${doc.sanitized}`, {
                          method: 'POST'
                        });
                      }
                      alert('Successfully uploaded all documents to Azure Blob Storage');
                    } catch (error) {
                      console.error('Error uploading files to blob storage:', error);
                      alert('Failed to upload files to Azure Blob Storage. Please try again.');
                    }
                  }}
                >
                  <i className="fas fa-cloud-upload-alt"></i> Upload to Cloud
                </button>
              </div>
            </div>

            <table className="document-table">
              <thead>
                <tr>
                  <th style={{ width: '60%' }}>Document Name</th>
                  <th style={{ width: '20%' }}>Processing Date</th>
                  <th style={{ width: '5%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, index) => (
                  <tr key={index}>
                    <td>
                      <span 
                        className="document-name"
                        onClick={() => setCurrentIndex(index)}
                      >
                        {doc.original}
                      </span>
                    </td>
                    <td>
                      <span className="document-date">
                        {new Date().toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <div className="document-actions">
                      <DocumentControls sanitizedDoc={doc.sanitized}/>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {currentDoc.original && currentDoc.sanitized && (
          <DocumentViewer originalDoc={currentDoc.original} sanitizedDoc={currentDoc.sanitized} />
        )}

        <div className="stats-and-controls">
          {currentDoc.stats && <DocumentStats stats={currentDoc.stats} />}
          <DocumentControls sanitizedDoc={currentDoc.sanitized}/>
        </div>

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
    </div>
  );
}
export default App;