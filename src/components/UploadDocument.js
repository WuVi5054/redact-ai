// src/components/UploadDocument.js
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { processDocument } from '../api/azureDocumentAPI';
import axios from 'axios';
// import fs from 'fs';

const UploadDocument = ({ addDocument, setLoading }) => {
  const onDrop = async (acceptedFiles) => {
    setLoading(true);
    const file = acceptedFiles[0];
    //console.log('Uploading file:', file);

    // Send the file to the backend
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('http://127.0.0.1:8000/process_file/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // console.log('Backend response:', response.data);
      // Add the original file to the uploaded_files folder
      try {
        // Send the file to the server
        const response = await axios.post('http://127.0.0.1:8000/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
    
        if (response.ok) {
          console.log('File uploaded');
        } else {
          console.error('Upload failed:', response.statusText);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
      //console.log(response.data.sanitized_file_name, file.name);
      addDocument(file.name, response.data.sanitized_file_name, response.data.stats );
    
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
