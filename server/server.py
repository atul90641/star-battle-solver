from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import string
from collections import OrderedDict

app = Flask(__name__)
CORS(app)

# Define the function to get color at given coordinates
def get_color_at_coordinates(img, x, y):
    if 0 <= x < img.width and 0 <= y < img.height:
        return img.getpixel((x, y))
    else:
        return "Coordinates out of bounds"

# Create a mapping from unique colors to characters
def create_color_mapping(image,grid_size):
    unique_colors = OrderedDict()  # To maintain order
    cell_size = image.height /(2*grid_size)  # Adjust based on actual cell size
    
    # Iterate over the matrix and add colors to the ordered set
    for n in range(grid_size):
        for m in range(grid_size):
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

@app.route('/')
def home():
    return 'Server is running.'

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
    

    # Create color mapping
    unique_colors, color_mapping = create_color_mapping(image,grid_size)
    
    # Create a matrix of character names based on the image
    cell_size = (image.height)/(2*grid_size)  # Size of each cell

    matrix = []
    for n in range(grid_size):
        row = []
        for m in range(grid_size):
            x = int(cell_size * (1 + 2 * m))
            y = int(cell_size * (1 + 2 * n))
            color = get_color_at_coordinates(image, x, y)
            if color in color_mapping:
                row.append(color_mapping[color])
            else:
                row.append('Unknown')  # If color not in mapping
        matrix.append(row)


    return jsonify({'matrix': matrix,
                    'uniqueColors': unique_colors,})

if __name__ == '__main__':
    app.run(debug=True)
