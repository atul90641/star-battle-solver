from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import numpy as np
import string
import io
from collections import OrderedDict
import string

app = Flask(__name__)
CORS(app)

# Define the function to get color at given coordinates
def get_color_at_coordinates(img, x, y):
    if 0 <= x < img.width and 0 <= y < img.height:
        return img.getpixel((x, y))
    else:
        return "Coordinates out of bounds"

# Create a mapping from unique colors to characters
def create_color_mapping(image):
    unique_colors = OrderedDict()  # To maintain order
    matrix_size = 8
    cell_size = 36  # Adjust based on actual cell size
    
    # Iterate over the matrix and add colors to the ordered set
    for n in range(matrix_size):
        for m in range(matrix_size):
            x = cell_size * (1 + 2 * m)
            y = cell_size * (1 + 2 * n)
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

    image_file = request.files['image']
    image = Image.open(image_file.stream).convert('RGB')

    # Create color mapping
    unique_colors, color_mapping = create_color_mapping(image)
    
    # Create a matrix of character names based on the image
    matrix_size = 8
    cell_size = 36  # Size of each cell

    matrix = []
    for n in range(matrix_size):
        row = []
        for m in range(matrix_size):
            x = cell_size * (1 + 2 * m)
            y = cell_size * (1 + 2 * n)
            color = get_color_at_coordinates(image, x, y)
            if color in color_mapping:
                row.append(color_mapping[color])
            else:
                row.append('Unknown')  # If color not in mapping
        matrix.append(row)

    return jsonify({'matrix': matrix,
        'uniqueColors': unique_colors})

if __name__ == '__main__':
    app.run(port=5000)
