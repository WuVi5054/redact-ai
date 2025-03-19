from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.storage.blob import BlobServiceClient
from utils import pdf_to_png, png_to_pdf, get_text_extraction, pii_recognition, overlay_sanitized_text_on_image
from fastapi.middleware.cors import CORSMiddleware
import itertools

from dotenv import load_dotenv
import fitz  # PyMuPDF
import shutil

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
load_dotenv()

# Set up Azure credentials
language_key = os.environ["LANGUAGE_KEY"]
language_endpoint = os.environ["LANGUAGE_ENDPOINT"]
vision_key = os.environ["VISION_KEY"]
vision_endpoint = os.environ["VISION_ENDPOINT"]

# Set up Azure clients
language_client = TextAnalyticsClient(endpoint=language_endpoint, credential=AzureKeyCredential(language_key))
vision_client = ImageAnalysisClient(endpoint=vision_endpoint, credential=AzureKeyCredential(vision_key))

# Set up Azure Blob Storage client
blob_connection_string = os.environ["AZURE_BLOB_CONNECTION_STRING"]  # Changed from AZURE_COSMOS_CONNECTION_STRING
blob_service_client = BlobServiceClient.from_connection_string(blob_connection_string)
container_name = os.environ["AZURE_BLOB_CONTAINER_NAME"]
container_client = blob_service_client.get_container_client(container_name)


counter = itertools.count(start=1)  # Starting from 1

# Define functions
@app.post("/process_file/")
async def process_file(file: UploadFile = File(...)):
    output_folder = "static"
    unique_id = next(counter)
    base_name = os.path.splitext(file.filename)[0]
    if file.filename.endswith(".png"):
        output_image = f"{base_name}_sanitized_{unique_id}.png"
        # Process PNG file
        text_extract = get_text_extraction(file.file)
        cleaned_documents, stats = pii_recognition(text_extract)
        sanitized_results = text_extract.read.blocks[0].lines
        for i in range(len(sanitized_results)):
            sanitized_results[i].text = cleaned_documents[i]
        overlay_sanitized_text_on_image(file.file, output_image, output_folder, sanitized_results, scale_factor=1.0)
        
        # Upload sanitized image to Azure Blob Storage during after processing if you would like
        # blob_client = container_client.get_blob_client(output_image)
        # with open(os.path.join(output_folder, output_image), "rb") as data:
        #     blob_client.upload_blob(data, overwrite=True)
        return {
            "sanitized_file_name": output_image,
            "sanitized_file_path": os.path.join(output_folder, output_image),
            "stats": stats
        }
    elif file.filename.endswith(".pdf"):
        output_image = f"{base_name}_sanitized_{unique_id}.png"
        output_pdf = f"{base_name}_sanitized_{unique_id}.pdf"
        # Convert PDF to PNG
        pdf_to_png(file.file, output_folder)
        # Process PNG file
        text_extract = get_text_extraction(os.path.join(output_folder, "page_1.png"))
        cleaned_documents, stats = pii_recognition(text_extract)
        sanitized_results = text_extract.read.blocks[0].lines
        for i in range(len(sanitized_results)):
            sanitized_results[i].text = cleaned_documents[i]
        overlay_sanitized_text_on_image(os.path.join(output_folder, "page_1.png"), output_image, output_folder, sanitized_results, scale_factor=1.0)
        png_to_pdf(os.path.join(output_folder, output_image), os.path.join(output_folder,output_pdf))
        # Upload sanitized image to Azure Blob Storage during after processing if you would like
        # blob_client = container_client.get_blob_client(output_pdf)
        # with open(os.path.join(output_folder, output_pdf), "rb") as data:
        #     blob_client.upload_blob(data, overwrite=True)
        return {
            "sanitized_file_name": output_pdf,
            "sanitized_file_path": os.path.join(output_folder, output_pdf),
            "stats": stats
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid file type")


UPLOAD_DIRECTORY = "static"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_location = f"{UPLOAD_DIRECTORY}/{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"info": f"File saved at {file_location}"}

@app.get("/download/{file_name}")
async def download_file(file_name: str):
    file_path = os.path.join(UPLOAD_DIRECTORY, file_name)
    
    # Check if the file exists
    if not os.path.exists(file_path):
        return {"error": "File not found"}
    
    # Return file response to download
    return FileResponse(file_path)

@app.post("/download_all")
async def download_all_files(files: list[UploadFile]):
    # Create a temporary directory for zip file
    import tempfile
    import zipfile
    from datetime import datetime
    
    # Generate unique zip filename
    zip_filename = f"sanitized_documents_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
    
    # Create temporary zip file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.zip') as temp_zip:
        with zipfile.ZipFile(temp_zip.name, 'w') as archive:
            # Add each file to the zip archive
            for file in files:
                file_path = os.path.join(UPLOAD_DIRECTORY, file.filename)
                if os.path.exists(file_path):
                    archive.write(file_path, file.filename)
        
        # Return the zip file
        return FileResponse(
            temp_zip.name,
            media_type='application/zip',
            filename=zip_filename
        )


@app.post("/upload-to-blob/")
async def upload_to_blob(filename: str):
    try:
        # Get file from static directory
        file_path = os.path.join(UPLOAD_DIRECTORY, filename)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        # Upload file to blob storage
        blob_client = container_client.get_blob_client(filename)
        with open(file_path, "rb") as data:
            blob_client.upload_blob(data, overwrite=True)
        
        return {
            "message": "File uploaded successfully",
            "blob_name": filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


