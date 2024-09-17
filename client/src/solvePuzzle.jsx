// src/solvePuzzle.js
export const solvePuzzle = (grid) => {
    const N = grid.length;  // Size of the matrix (8x8)
    let colors;
    if(N === 8)
        colors = 'ABCDEFGH';
    else if(N === 10)
        colors = 'ABCDEFGHIJ';
    else
        colors = 'ABCDEFGHIJKLMN';
    
    let hasStar = Array.from({ length: N }, () => Array(N).fill(false));
    let rowUsed = Array(N).fill(false);
    let colUsed = Array(N).fill(false);
  
    const canPlaceStar = (r, c) => {
      const directions = [
        [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]
      ];
      return directions.every(([dx, dy]) => {
        const nr = r + dx, nc = c + dy;
        return nr < 0 || nr >= N || nc < 0 || nc >= N || !hasStar[nr][nc];
      });
    };
  
    const solve = (colorIndex) => {
      if (colorIndex === colors.length) return true;
  
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (grid[r][c] === colors[colorIndex] && !rowUsed[r] && !colUsed[c] && canPlaceStar(r, c)) {
            hasStar[r][c] = true;
            rowUsed[r] = true;
            colUsed[c] = true;
  
            if (solve(colorIndex + 1)) return true;
  
            hasStar[r][c] = false;
            rowUsed[r] = false;
            colUsed[c] = false;
          }
        }
      }
  
      return false;
    };
  
    if (solve(0)) {
      return hasStar;
    } else {
      return null;
    }
  };
  