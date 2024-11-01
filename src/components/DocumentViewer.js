// src/components/DocumentViewer.js
import React from 'react';
import axios from 'axios';


import { useEffect, useState } from "react";

const DocumentViewer = ({ originalDoc, sanitizedDoc }) => {
  const [originalImageData, setOriginalImageData] = useState(null);
  const [sanitizedImageData, setSanitizedImageData] = useState(null);

  useEffect(() => {
    const getOriginalImageData = async () => {
      const { data } = await axios.get(`http://127.0.0.1:8000/download/${originalDoc}`, {
        responseType: 'blob',
      });
      setOriginalImageData(URL.createObjectURL(data));
    };

    const getSanitizedImageData = async () => {
      const { data } = await axios.get(`http://127.0.0.1:8000/download/${sanitizedDoc}`, {
        responseType: 'blob',
      });
      setSanitizedImageData(URL.createObjectURL(data));
    };

    getSanitizedImageData();
    getOriginalImageData();
  }, [originalDoc, sanitizedDoc]);


  return (
    <div className="document-viewer">
      <div className="document-section">
        <h2>Original Document</h2>
        {originalDoc ? (
          <iframe src={originalImageData} title="Original Document" className="document-frame" />
        ) : (
          <p>Loading original document...</p>
        )}
      </div>
      <div className="document-section">
        <h2>Sanitized Document</h2>
        {sanitizedDoc ? (
          <iframe  src={sanitizedImageData} title ="Sanitized Document" className="document-frame" />
        ) : (
          <p>Loading sanitized document...</p>
        )}
      </div>
    </div>
  );
};


export default DocumentViewer;


// const DocumentViewer = ({ originalDoc, sanitizedDoc }) => (
//   <div className="document-viewer">
//     <div className="document-section">
//       <h2>Original Document</h2>
//       <iframe src={originalDoc} title="Original Document" className="document-frame" />
//     </div>
//     <div className="document-section">
//       <h2>Sanitized Document</h2>
//       <iframe src={sanitizedDoc} title="Sanitized Document" className="document-frame" />
//     </div>
//   </div>
// );

// export default DocumentViewer;
