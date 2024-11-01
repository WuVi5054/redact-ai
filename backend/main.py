from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential
from azure.ai.vision.imageanalysis import ImageAnalysisClient
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


counter = itertools.count(start=1)  # Starting from 1

# Define functions
@app.post("/process_file/")
async def process_file(file: UploadFile = File(...)):
    output_folder = "static"
    unique_id = next(counter)
    output_image = f"sanitized_image_{unique_id}.png"
    output_pdf = f"sanitized_output_{unique_id}.pdf"
    if file.filename.endswith(".png"):
        # Process PNG file
        text_extract = get_text_extraction(file.file)
        cleaned_documents, stats = pii_recognition(text_extract)
        sanitized_results = text_extract.read.blocks[0].lines
        for i in range(len(sanitized_results)):
            sanitized_results[i].text = cleaned_documents[i]
        overlay_sanitized_text_on_image(file.file, output_image, output_folder, sanitized_results, scale_factor=1.0)
        return {
            "sanitized_file_name": output_image,
            "sanitized_file_path": os.path.join(output_folder, output_image),
            "stats": stats
        }
    elif file.filename.endswith(".pdf"):
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


