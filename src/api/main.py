from fastapi import FastAPI, File, UploadFile, HTTPException
import os
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from utils import pdf_to_png, png_to_pdf, get_text_extraction, pii_recognition, overlay_sanitized_text_on_image
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
import fitz  # PyMuPDF

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

# Define functions
@app.post("/process_file/")
async def process_file(file: UploadFile = File(...)):
    # Check file type
    if file.filename.endswith(".png"):
        # Process PNG file
        text_extract = get_text_extraction(file.file)
        cleaned_documents = pii_recognition(text_extract)
        sanitized_results = text_extract.read.blocks[0].lines
        for i in range(len(sanitized_results)):
            sanitized_results[i].text = cleaned_documents[i]
        output_image = "sanitized_image.png"
        overlay_sanitized_text_on_image(file.file, output_image, sanitized_results, scale_factor=1.0)
        return {
            "file_name": output_image,
            # "file_data": open(output_image, "rb").read()
            }
    elif file.filename.endswith(".pdf"):
        # Convert PDF to PNG
        output_folder = "output_folder"
        pdf_to_png(file.file, output_folder)
        # Process PNG file
        text_extract = get_text_extraction(os.path.join(output_folder, "page_1.png"))
        cleaned_documents = pii_recognition(text_extract)
        sanitized_results = text_extract.read.blocks[0].lines
        for i in range(len(sanitized_results)):
            sanitized_results[i].text = cleaned_documents[i]
        output_image = "sanitized_image.png"
        overlay_sanitized_text_on_image(os.path.join(output_folder, "page_1.png"), output_image, sanitized_results, scale_factor=1.0)
        png_to_pdf("sanitized_image.png", "sanitized_output.pdf")
        return {
            "file_name": "sanitized_output.pdf",
            # "file_data": open("sanitized_output.pdf", "rb").read()
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
# @app.get("/data")
# async def get_data():
#     # Simulate external API calls
#     responses = ["Hello from API 1", "Hello from API 2"]
#     return {"data": responses}

# @app.post("/uploadfile/")
# async def create_upload_file(file: UploadFile = File(...)):
#     # Save or process the file
#     file_location = f"uploaded_files/{file.filename}"
#     with open(file_location, "wb") as f:
#         f.write(await file.read())

#     return {"info": f"File '{file.filename}' uploaded successfully"}


