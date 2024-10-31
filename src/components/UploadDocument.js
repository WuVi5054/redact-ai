// src/components/UploadDocument.js
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { processDocument } from '../api/azureDocumentAPI';

const UploadDocument = ({ addDocument, setLoading }) => {
  const onDrop = async (acceptedFiles) => {
    setLoading(true);
    const file = acceptedFiles[0];
    const response = await processDocument(file);

    if (response) {
      addDocument(response.original, response.sanitized, response.stats);
    }
    setLoading(false);
  };

  const { getRootProps, getInputProps } = useDropzone({ 
    onDrop, 
    accept: 'application/pdf, image/*, text/*' 
  });

  return (
    <div className="upload-container" {...getRootProps()}>
      <input {...getInputProps()} />
      <p>Drag & drop a document, or click to select</p>
    </div>
  );
};

export default UploadDocument;
