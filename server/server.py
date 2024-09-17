from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import numpy as np
import cv2
import string
import io
from collections import OrderedDict

app = Flask(__name__)
CORS(app)

def detect_and_crop_colored_squares(image):
    # Convert PIL image to OpenCV format (numpy array)
    image = np.array(image)
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)  # Convert RGB to BGR

    if image is None:
        print("Error loading image.")
        return

    # Convert the image to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Apply edge detection
    edges = cv2.Canny(gray, 50, 150)

    # Find contours in the edged image
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    cropped_count = 0

    # Loop through each contour
    for contour in contours:
        # Approximate the contour to a polygon and check if it's a square
        epsilon = 0.02 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)

        # If the approximated polygon has 4 sides, it might be a square
        if len(approx) == 4:
            # Get bounding box coordinates
            x, y, w, h = cv2.boundingRect(approx)
            
            # Check if it's a square by comparing width and height
            aspect_ratio = w / float(h)
            if 0.95 <= aspect_ratio <= 1.05:  # Allow some tolerance for approximation
                # Crop the square from the image
                square = image[y:y + h, x:x + w]
                
                # Crop 1 pixel from the left and top
                square = square[1:, 1:]

                cropped_count += 1
                return square  # Return the first detected square
    
    if cropped_count == 0:
        print("No colored squares detected.")
        return image  # Return original image if no squares found

# Define the function to get color at given coordinates
def get_color_at_coordinates(img, x, y):
    if 0 <= x < img.width and 0 <= y < img.height:
        return img.getpixel((x, y))
    else:
        return "Coordinates out of bounds"

# Create a mapping from unique colors to characters
def create_color_mapping(image,grid_size):
    unique_colors = OrderedDict()  # To maintain order
    matrix_size = grid_size
    cell_size = image.height /(2*matrix_size)  # Adjust based on actual cell size
    
    # Iterate over the matrix and add colors to the ordered set
    for n in range(matrix_size):
        for m in range(matrix_size):
            x = int(cell_size * (1 + 2 * m))
            y = int(cell_size * (1 + 2 * n))
            color = get_color_at_coordinates(image, x, y)
            if color != "Coordinates out of bounds":
                unique_colors[color] = None  # Add color to the OrderedDict
    
    # Convert the keys of OrderedDict to a list
    unique_colors_list = list(unique_colors.keys())
    
    # Create a mapping of colors to characters
    color_to_char = {}
    alphabet = string.ascii_uppercase  # A, B, C, ..., Z
    
    for index, color in enumerate(unique_colors_list):
        if index < len(alphabet):
            color_to_char[color] = alphabet[index]
        else:
            color_to_char[color] = f'Custom{index - len(alphabet) + 1}'
    
    # Return both the unique colors and the mapping
    return  unique_colors_list, color_to_char

@app.route('/recognize-colors', methods=['POST'])
def recognize_colors():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    # Check if gridSize is provided
    grid_size = request.form.get('gridSize')
    if not grid_size:
        return jsonify({'error': 'Grid size not provided'}), 400

    grid_size = int(grid_size)  # Convert gridSize to integer

    image_file = request.files['image']
    image = Image.open(image_file.stream).convert('RGB')
    
    # Detect and crop colored squares
    cropped_image = detect_and_crop_colored_squares(image)
    if cropped_image is None:
        return jsonify({'error': 'No colored squares detected'}), 400

    # Convert cropped image back to PIL format for color processing
    cropped_image = Image.fromarray(cv2.cvtColor(cropped_image, cv2.COLOR_BGR2RGB))

    # Create color mapping
    unique_colors, color_mapping = create_color_mapping(cropped_image,grid_size)
    
    # Create a matrix of character names based on the image
    matrix_size = grid_size
    cell_size = (image.height)/(2*matrix_size)  # Size of each cell

    matrix = []
    for n in range(matrix_size):
        row = []
        for m in range(matrix_size):
            x = int(cell_size * (1 + 2 * m))
            y = int(cell_size * (1 + 2 * n))
            color = get_color_at_coordinates(cropped_image, x, y)
            if color in color_mapping:
                row.append(color_mapping[color])
            else:
                row.append('Unknown')  # If color not in mapping
        matrix.append(row)

    return jsonify({'matrix': matrix,
                    'uniqueColors': unique_colors,})

if __name__ == '__main__':
    app.run(port=5000)
