from pdf2image import convert_from_path

def pdf_to_png(pdf_file, output_folder):
    images = convert_from_path(pdf_file)
    for i, image in enumerate(images):
        output_path = f"{output_folder}/page_{i + 1}.png"
        image.save(output_path, "PNG")
        print(f"Saved page {i + 1} as {output_path}")

# Example usage
pdf_to_png("Yuyou_Liu_08.28.24.pdf", "output_folder")