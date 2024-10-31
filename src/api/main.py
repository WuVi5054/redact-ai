from fastapi import FastAPI, File, UploadFile, HTTPException
import requests
from typing import List

app = FastAPI()

@app.get("/data")
async def get_data():
    # Simulate external API calls
    responses = ["Hello from API 1", "Hello from API 2"]
    # try:
    #     # Example external API calls
    #     response1 = requests.get("https://api.example.com/data1")
    #     response2 = requests.get("https://api.example.com/data2")
    #     responses.append(response1.json())
    #     responses.append(response2.json())
    # except requests.exceptions.RequestException as e:
    #     raise HTTPException(status_code=500, detail=str(e))

    return {"data": responses}

@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile = File(...)):
    # Save or process the file
    file_location = f"uploaded_files/{file.filename}"
    with open(file_location, "wb") as f:
        f.write(await file.read())

    return {"info": f"File '{file.filename}' uploaded successfully"}
