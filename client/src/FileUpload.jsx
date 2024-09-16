import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { solvePuzzle } from './solvePuzzle';

const FileUpload = () => {
  const [solvedPuzzle, setSolvedPuzzle] = useState(null);
  const [error, setError] = useState(null);
  const [color_list, setColorList] = useState(null);
  const [matrix, setMatrix] = useState(null);
  const [starIndices, setStarIndices] = useState([]);

  // Handle the file input or pasted image
  const handleImageUpload = (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    axios.post('http://localhost:5000/recognize-colors', formData)
      .then(response => {
        const matrix = response.data.matrix;
        setMatrix(matrix);
        setColorList(response.data.uniqueColors);
        const solution = solvePuzzle(matrix);
        setSolvedPuzzle(solution);
        extractStarIndices(solution);
        setError(null);
      })
      .catch(err => {
        setError('Error uploading image');
        setSolvedPuzzle(null);
      });
  };

  // Extract star indices from the solved puzzle
  const extractStarIndices = (puzzle) => {
    const indices = [];
    puzzle.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        if (cell === true) {  // Check if the cell contains a star
          const index = rowIndex * row.length + cellIndex;  // Calculate the flat index
          indices.push(index);
        }
      });
    });
    setStarIndices(indices);  // Update state with star indices
  };

  // Handle file change via input
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Handle paste event for pasting image from clipboard
  const handlePaste = (event) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        handleImageUpload(blob);
        event.preventDefault();  // Prevent any other pasting behavior
        break;
      }
    }
  };

  useEffect(() => {
    // Add event listener for paste
    window.addEventListener('paste', handlePaste);
    return () => {
      // Remove event listener when component is unmounted
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  // Function to copy content to clipboard
  const copyToClipboard = () => {
    const code = `
    function setCellState(cellId, state) {
      const cell = document.getElementById(cellId);
      if (cell) {
        cell.classList.remove('fa-circle', 'fa-star');
        if (state === 'dot') {
          cell.classList.add('fa-circle');  // Add dot icon
        } else if (state === 'star') {
          cell.classList.add('fa-star');  // Add star icon
        } 
      }
    }
    
    setCellState('box${starIndices[0]}', 'star');
    setCellState('box${starIndices[1]}', 'star');
    setCellState('box${starIndices[2]}', 'star');
    setCellState('box${starIndices[3]}', 'star');
    setCellState('box${starIndices[4]}', 'star');
    setCellState('box${starIndices[5]}', 'star');
    setCellState('box${starIndices[6]}', 'star');
    setCellState('box${starIndices[7]}', 'star');
      `;

    navigator.clipboard.writeText(code).then(() => {
      console.log('Code copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy code: ', err);
    });
  };


  // Rendering the solved puzzle matrix
  const renderSolution = () => {
    if (!solvedPuzzle || !matrix || !color_list) return null;  // Ensure matrix and color_list are available

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',  // Full viewport height
      }}>
        <table style={{ borderCollapse: 'collapse', borderSpacing: '0' }} border="1">
          <tbody>
            {solvedPuzzle.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => {
                  // Get the matrix value, ensure it is valid
                  const name = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
                  const letter = matrix[rowIndex][cellIndex];  // Get the letter in the matrix
                  const colorIndex = name.indexOf(letter);  // Get the index of the letter in the 'name' array

                  if (typeof colorIndex !== 'number' || colorIndex < 0 || colorIndex >= color_list.length) {
                    return <td key={cellIndex} style={{ width: '50px', height: '50px' }} />; // Handle invalid index
                  }

                  // Fetch corresponding RGB color from color_list
                  const [R, G, B] = color_list[colorIndex] || [0, 0, 255];  // Fallback to white if undefined
                  const backgroundColor = `rgb(${R}, ${G}, ${B})`;  // Convert RGB to CSS

                  return (
                    <td
                      key={cellIndex}
                      style={{
                        width: '50px',
                        height: '50px',
                        textAlign: 'center',
                        backgroundColor: backgroundColor,  // Apply background color

                      }}
                    >
                      {cell ? '★' : ''}  {/* Optional star symbol if there's a value */}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {error && <p>{error}</p>}
      {renderSolution()}
      <p>Paste an image using Ctrl+V (or Command+V on Mac).</p>
      <div>
        <h3>Star Indices:</h3>
        <p>
          Done!
        </p>
        <button style={{ backgroundColor: 'lightgreen' }} onClick={copyToClipboard}>Copy Code</button>
      </div>
    </div>
  );
};

export default FileUpload;
