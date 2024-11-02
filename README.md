
# SafeDocs AI

SafeDocs AI is a data privacy and document management solution designed to clean sensitive personal data from documents, ensuring compliance with privacy regulations like GDPR. 

The project leverages Azure AI Computer Vision to perform OCR (Optical Character Recognition) and extract data from documents. Then Azure AI Language Service will then run a data sensitivity check, replacing sensitive data (such as personally identifiable information, PII) with generic placeholders. The cleaned-up version of the document will be displayed side by side with the original, allowing users to save and use the sanitized document safely in further processing without leaking sensitive information.

This project ensures that sensitive information is protected while maintaining document usability for tasks like analysis, AI training, or reporting.


## Features
- Text Extraction: Uses Azure AI Computer Vision to perform OCR and extract text from documents.
- Sanitizing PII Data: Azure AI Language Services detects and scrubs PII in the extracted text, replacing sensitive information in the document.
- Side-by-Side Comparison: Displays both original and sanitized documents for user comparison.
- React and FastAPI Web Application: Provides an interactive interface for seamless backend and frontend communication.
## Tech Stack


- Azure AI Computer Vision
- Azure AI Language Services
- React
- FastAPI
## Demo

Need the link


## Environment Variables

To run this project, add the following environment variables to your .env file. Ensure these resources are created in Azure before running the application:

- Azure AI Services:
    - Language Service
    - Computer Vision



```
VISION_KEY=<Your Azure Vision API Key>
VISION_ENDPOINT=<Your Azure Vision API Endpoint>
LANGUAGE_KEY=<Your Azure Language API Key>
LANGUAGE_ENDPOINT=<Your Azure Language API Endpoint>
```


## Run Locally (You will need to setup the Azure Resources)

Clone the project

```bash
  git clone https://github.com/tonidavisj/safedocsai.git
```

Install dependencies

```bash
  pip install -r requirements.txt
  npm install
```

Start the frontend server

```bash
  npm run start
```

Go to the project directory for the backend

```bash
  cd backend
```


Start the backend server

```bash
  uvicorn main:app --reload
```


## Future Improvements

- Support More File Types: Expand compatibility to other document types like DOCX, TXT, etc.
- Enhanced Data Scrubbing: Improve the precision of PII detection and seamless integration back into the original document.
- Analytics Dashboard: Add a dashboard showing insights on scrubbed data types and frequency.
- User Authentication: Implement user authentication to restrict access to sensitive features.