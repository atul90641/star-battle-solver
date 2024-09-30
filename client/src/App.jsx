import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { solvePuzzle } from './components/solvePuzzle';
import MatrixDisplay from './components/MatrixDisplay';
import useClipboard from './components/useClipboard';
import { handleFileChange, handlePaste } from './components/imageHandlers'; // Import the handlers
import VideoPlayer from './components/VideoPlayer';
const App = () => {
  const [solvedPuzzle, setSolvedPuzzle] = useState(null);
  const [error, setError] = useState(null);
  const [colorList, setColorList] = useState(null);
  const [matrix, setMatrix] = useState(null);
  const [starIndices, setStarIndices] = useState([]);
  const [gridSize, setGridSize] = useState(null); // Initialize as null
  const { copyToClipboard } = useClipboard(starIndices);
  const [showNotification, setShowNotification] = useState(false);
  useEffect(() => {
    if (error) {
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 5000); // Hide after 3 seconds
    }
  }, [error]);

  // Handle the image upload logic
  const handleImageUpload = (imageFile, gridSize, setError) => {
    if (gridSize === null) {
      setError('Please select a grid size first.');
      return;
    }

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('gridSize', gridSize);

    axios.post('https://star-battle-solver-server.vercel.app/recognize-colors', formData)
      .then(response => {
        const matrix = response.data.matrix;
        console.log(response.data);
        if (matrix.length !== gridSize || matrix.some(row => row.length !== gridSize)) {
          setError(`Matrix dimensions (${matrix.length}x${matrix[0].length}) do not match the selected grid size (${gridSize})`);
          setSolvedPuzzle(null);
          return;
        }

        setMatrix(matrix);
        setColorList(response.data.uniqueColors);
        const solution = solvePuzzle(matrix); // Pass gridSize if needed by solvePuzzle
        setSolvedPuzzle(solution);
        extractStarIndices(solution);
        setError(null);
      })
      .catch(err => {
        setError('Error processing the image. Please crop it to ensure only the matrix is visible.');
        setSolvedPuzzle(null);
      });
  };

  // Extract star indices from the solved puzzle
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

  // Add event listener for paste events
  useEffect(() => {
    const handlePasteEvent = (event) => handlePaste(event, gridSize, handleImageUpload, setError);
    window.addEventListener('paste', handlePasteEvent);
    return () => {
      window.removeEventListener('paste', handlePasteEvent);
    };
  }, [gridSize]); // Add gridSize as a dependency to ensure it's up-to-date

  return (
    <div>
      <h1>Star Battle Solver</h1>
      <VideoPlayer /> 
      <a
        href="https://starbattle.puzzlebaron.com/init.php"
        className="button2"
        target="_blank" // Opens in a new tab
        rel="noopener noreferrer" // Security feature
      >
        Puzzles to solve
      </a>
      
    <div className="file-upload-container">
      {/* Floating Notification */}
      {error && (
        <div className={`notification ${showNotification ? 'show' : 'hide'}`}>
          <p>{error}</p>
        </div>
      )}
      {gridSize === null ? (
        <div className="grid-select-container">
          <p>Please select a grid size:</p>
          <select value={gridSize || ''} onChange={(e) => setGridSize(Number(e.target.value))}>
            <option value="" disabled>Select grid size</option>
            <option value={8}>8x8 - 1 Star</option>
            <option value={10}>10x10 - 1 Star</option>
          </select>
        </div>
      ) : (
        <div>
          {gridSize !== null && (
            <p className="centered-text">{gridSize}x{gridSize} - 1 Star</p>
          )}
          <input type="file" accept="image/*" onChange={(event) => handleFileChange(event, gridSize, handleImageUpload, setError)} />
          <div>
            <MatrixDisplay solvedPuzzle={solvedPuzzle} matrix={matrix} colorList={colorList} />
          </div>
          {!error && solvedPuzzle && (
            <div>
              <p>Done!</p>
              <button className='button' onClick={copyToClipboard}>Copy Code</button>
            </div>
          )}
        </div>
      )}
    </div>
    </div>
  );
};

export default App;