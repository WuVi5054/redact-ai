// src/components/UploadDocument.js
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { processDocument } from '../api/azureDocumentAPI';
import axios from 'axios';


const UploadDocument = ({ addDocument, setLoading }) => {
  const onDrop = async (acceptedFiles) => {
    setLoading(true);
    const file = acceptedFiles[0];
    console.log(file);  
    console.log('Uploading file:', file);

    // Send the file to the backend
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('http://127.0.0.1:8000/process_file/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Backend response:', response.data);

      // Add the returned file to the addDocument function
      addDocument(response.data.file, 'sanitized', { stats: 'some stats' });
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }


    // const response = await processDocument(file);
    // console.log(response);

    // if (response) {
    //   addDocument(response.original, response.sanitized, response.stats);
    // }
    // setLoading(false);
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
