import fitz  # PyMuPDF
import os
from PIL import Image
import os
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.ai.vision.imageanalysis.models import VisualFeatures
from azure.core.credentials import AzureKeyCredential
from dotenv import load_dotenv
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential
from PIL import Image, ImageDraw, ImageFont


language_key = os.environ["LANGUAGE_KEY"]
language_endpoint = os.environ["LANGUAGE_ENDPOINT"]

def pdf_to_png(pdf_file, output_folder):
    os.makedirs(output_folder, exist_ok=True)
    
    if isinstance(pdf_file, str):
        pdf_document = fitz.open(pdf_file)
    else:
        # Otherwise, assume pdf_file is a file-like object
        pdf_document = fitz.open(stream=pdf_file.read(), filetype="pdf")
    
    # Loop through each page and save as PNG
    for page_num in range(len(pdf_document)):
        page = pdf_document[page_num]
        # Render page as an image with 2x resolution
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        
        # Define output path and save image
        output_path = os.path.join(output_folder, f"page_{page_num + 1}.png")
        pix.save(output_path)
        print(f"Saved page {page_num + 1} as {output_path}")

    # Close the PDF document
    pdf_document.close()

# Example usage with absolute path
#pdf_to_png("src/api/Yuyou_Liu_08.28.24.pdf", "output_folder")


def png_to_pdf(png_file, pdf_file):
    image = Image.open(png_file)
    # Convert to RGB if the image has an alpha channel
    if image.mode == "RGBA":
        image = image.convert("RGB")
    image.save(pdf_file, "PDF")
    print(f"Converted {png_file} to {pdf_file}")

# Example usage
#png_to_pdf("output_folder/page_1.png", "output.pdf")




def get_text_extraction(file_path):
    # Set the values of your computer vision endpoint and computer vision key
    # as environment variables:
    try:
        load_dotenv()
        endpoint = os.environ["VISION_ENDPOINT"]
        key = os.environ["VISION_KEY"]
    except KeyError:
        print("Missing environment variable 'VISION_ENDPOINT' or 'VISION_KEY'")
        print("Set them before running this sample.")
        exit()

    # Create an Image Analysis client
    client = ImageAnalysisClient(
        endpoint=endpoint,
        credential=AzureKeyCredential(key)
    )

    # Get a caption for the image. This will be a synchronously (blocking) call.
    if hasattr(file_path, 'read'):  # Check if it is a file
        result = client.analyze(
            image_data=file_path,
            visual_features=[VisualFeatures.CAPTION, VisualFeatures.READ],
            gender_neutral_caption=True,  # Optional (default is False)
        )
    else:  # It is a file path
        with open(file_path, "rb") as image_file:
            result = client.analyze(
                image_data=image_file,
                visual_features=[VisualFeatures.CAPTION, VisualFeatures.READ],
                gender_neutral_caption=True,  # Optional (default is False)
            )

    # Only for printing results
    print("Image analysis results:")
    # Print caption results to the console
    print(" Caption:")
    if result.caption is not None:
        print(f"   '{result.caption.text}', Confidence {result.caption.confidence:.4f}")

    # Print text (OCR) analysis results to the console
    print(" Read:")
    if result.read is not None:
        for line in result.read.blocks[0].lines:
            print(f"   Line: '{line.text}', Bounding box {line.bounding_polygon}")
            for word in line.words:
                print(f"     Word: '{word.text}', Bounding polygon {word.bounding_polygon}, Confidence {word.confidence:.4f}")
    return result

#text_extract = get_text_extraction("output_folder/page_1.png")






# Authenticate the client using your key and endpoint
def authenticate_client():
    ta_credential = AzureKeyCredential(language_key)
    text_analytics_client = TextAnalyticsClient(
            endpoint=language_endpoint,
            credential=ta_credential)
    return text_analytics_client

# Example method for detecting sensitive information (PII) from text
def pii_recognition(result):
    client = authenticate_client()
    documents = [line.text for line in result.read.blocks[0].lines]

    # Process documents in batches of 5
    count = 0

    for i in range(0, len(documents), 5):
        count += 1
        if count > 1:
          break
        batch = documents[i : i + 5]  # Get a batch of up to 5 documents
        response = client.recognize_pii_entities(batch, language="en")
        for idx, doc in enumerate(response):
            if doc.is_error:
                continue

            modified_text = documents[i + idx]  # Current document in original list
            print("Redacted Text: {}".format(doc.redacted_text))

            # Replace each detected entity with its category
            for entity in doc.entities:
                category_placeholder = f"[{entity.category}]"  # Placeholder e.g., "[Person]"

                # Perform the replacement in the original document text
                modified_text = modified_text.replace(entity.text, category_placeholder)

                # Printing
                print("Entity: {}".format(entity.text))
                print("\tCategory: {}".format(entity.category))
                print("\tConfidence Score: {}".format(entity.confidence_score))
                print("\tOffset: {}".format(entity.offset))
                print("\tLength: {}".format(entity.length))
            # Update the document with the modified text
            documents[i + idx] = modified_text

    # Print out final scrubbed documents
    for doc in documents:
        print(doc)
    return documents




#cleaned_documents = pii_recognition(text_extract)



# sanitized_results = text_extract.read.blocks[0].lines
# for i in range(len(sanitized_results)):
#   sanitized_results[i].text = cleaned_documents[i]
# print(cleaned_documents)
# print(sanitized_results)





def overlay_sanitized_text_on_image(input_image, output_image, result, scale_factor=1.0):
    # Open the image
    if hasattr(input_image, 'read'):  # Check if it is a file
        image = Image.open(input_image)
    elif os.path.isfile(input_image):  # Check if it is a file path
        image = Image.open(input_image)
    else:
        raise ValueError("Input image must be a file path or a file-like object")
    draw = ImageDraw.Draw(image)

    for line in result:
        # Sanitize text
        sanitized_line_text = line.text
        line_bbox = line.bounding_polygon

        # Convert bounding box coordinates
        x0 = line_bbox[0]['x'] * scale_factor
        y0 = line_bbox[0]['y'] * scale_factor
        x2 = line_bbox[2]['x'] * scale_factor
        y2 = line_bbox[2]['y'] * scale_factor

        # Draw white rectangle over the original text
        draw.rectangle([x0, y0, x2, y2], fill="white")

        # Calculate font size and draw sanitized text
        rect_height = y2 - y0
        font_size = int(min(rect_height * 0.8, 30))  # Set font size based on rectangle height
        font = ImageFont.load_default(font_size)

        # Insert sanitized text
        draw.text((x0, y0), sanitized_line_text, fill="black", font=font)

    # Save the sanitized image
    image.save(output_image)
    print(f"Sanitized image saved as {output_image}")

# Example usage
#overlay_sanitized_text_on_image("output_folder/page_1.png", "sanitized_image.png", sanitized_results, scale_factor=1.0)