// src/components/MatrixDisplay.jsx
import React from 'react';

const MatrixDisplay = ({ solvedPuzzle, matrix, colorList }) => {
  if (!solvedPuzzle || !matrix || !colorList) return null;

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

                if (typeof colorIndex !== 'number' || colorIndex < 0 || colorIndex >= colorList.length) {
                  return <td key={cellIndex} style={{ width: '50px', height: '50px' }} />;
                }

                const [R, G, B] = colorList[colorIndex] || [0, 0, 255];
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

export default MatrixDisplay;