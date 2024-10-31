const axios = require('axios');
const fs = require('fs');


// To get data
const getData = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/data');
    console.log(response.data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// To upload a file
const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await axios.post('http://127.0.0.1:8000/uploadfile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

getData();
const file = fs.readFileSync("./output (4).pdf");
uploadFile(new Blob([file]));  // Change the file name as needed
