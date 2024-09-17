import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { solvePuzzle } from './solvePuzzle';

const FileUpload = () => {
  const [solvedPuzzle, setSolvedPuzzle] = useState(null);
  const [error, setError] = useState(null);
  const [color_list, setColorList] = useState(null);
  const [matrix, setMatrix] = useState(null);
  const [starIndices, setStarIndices] = useState([]);
  const [gridSize, setGridSize] = useState(null); // Initialize as null
  
  // Handle the file input or pasted image
  const handleImageUpload = (imageFile) => {
    if (gridSize === null) {
      setError('Please select a grid size first.');
      return;
    }

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('gridSize', gridSize);

    axios.post('http://localhost:5000/recognize-colors', formData)
      .then(response => {
        const matrix = response.data.matrix;
        
        if (matrix.length !== gridSize || matrix.some(row => row.length !== gridSize)) {
          setError(`Matrix dimensions (${matrix.length}x${matrix[0].length}) do not match the selected grid size (${gridSize})`);
          setSolvedPuzzle(null);
          return;
        }
        
        setMatrix(matrix);
        setColorList(response.data.uniqueColors);
        const solution = solvePuzzle(matrix, gridSize); // Pass gridSize if needed by solvePuzzle
        setSolvedPuzzle(solution);
        extractStarIndices(solution);
        setError(null);
      })
      .catch(err => {
        setError('Error processing the image. Please crop it to ensure only the matrix is visible.');
        setSolvedPuzzle(null);
      });
  };

  const extractStarIndices = (puzzle) => {
    const indices = [];
    puzzle.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        if (cell === true) {
          const index = rowIndex * row.length + cellIndex;
          indices.push(index);
        }
      });
    });
    setStarIndices(indices);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handlePaste = (event) => {
    if (gridSize === null) {
      setError('Please select a grid size first.');
      event.preventDefault();
      return;
    }

    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        handleImageUpload(blob);
        event.preventDefault();
        break;
      }
    }
  };

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [gridSize]); // Add gridSize as a dependency to ensure it's up-to-date

  const copyToClipboard = () => {
    const setCellStateCalls = starIndices
      .map(index => `setCellState('box${index}', 'star');`)
      .join('\n');
  
    const code = `
      function setCellState(cellId, state) {
        const cell = document.getElementById(cellId);
        if (cell) {
          cell.classList.remove('fa-circle', 'fa-star');
          if (state === 'dot') {
            cell.classList.add('fa-circle');
          } else if (state === 'star') {
            cell.classList.add('fa-star');
          } 
        }
      }
  
      ${setCellStateCalls}
    `;
  
    navigator.clipboard.writeText(code)
      .then(() => {
        console.log('Code copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy code: ', err);
      });
  };

  const renderSolution = () => {
    if (!solvedPuzzle || !matrix || !color_list) return null;

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}>
        <table style={{ borderCollapse: 'collapse', borderSpacing: '0' }} border="1">
          <tbody>
            {solvedPuzzle.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => {
                  const name = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
                  const letter = matrix[rowIndex][cellIndex];
                  const colorIndex = name.indexOf(letter);

                  if (typeof colorIndex !== 'number' || colorIndex < 0 || colorIndex >= color_list.length) {
                    return <td key={cellIndex} style={{ width: '50px', height: '50px' }} />;
                  }

                  const [R, G, B] = color_list[colorIndex] || [0, 0, 255];
                  const backgroundColor = `rgb(${R}, ${G}, ${B})`;

                  return (
                    <td
                      key={cellIndex}
                      style={{
                        width: '50px',
                        height: '50px',
                        textAlign: 'center',
                        backgroundColor: backgroundColor,
                      }}
                    >
                      {cell ? '★' : ''}
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
      {gridSize === null ? (
        <div>
          <p>Please select a grid size:</p>
          <select value={gridSize || ''} onChange={(e) => setGridSize(Number(e.target.value))}>
            <option value="" disabled>Select grid size</option>
            <option value={8}>8</option>
            <option value={10}>10</option>
          </select>
        </div>
      ) : (
        <div>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {error && <p>{error}</p>}
          {renderSolution()}
          <div>
            <p>Done!</p>
            <button style={{ backgroundColor: 'lightgreen' }} onClick={copyToClipboard}>Copy Code</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
