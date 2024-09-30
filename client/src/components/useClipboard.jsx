// src/components/useClipboard.jsx
import { useCallback } from 'react';

const useClipboard = (starIndices) => {
  const copyToClipboard = useCallback(() => {
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
  }, [starIndices]);

  return { copyToClipboard };
};

export default useClipboard;