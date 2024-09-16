import React, { useState } from 'react';

const CodeCopyComponent = () => {
    const codeSnippet = `
function setCellState(cellId, state) {
    const cell = document.getElementById(cellId);
    if (cell) {
        // Remove all icon classes
        cell.classList.remove('fa-circle', 'fa-star');
        
        if (state === 'dot') {
            cell.classList.add('fa-circle');  // Add dot icon
        } else if (state === 'star') {
            cell.classList.add('fa-star');  // Add star icon
        } 
        // No need to add anything for 'blank' state as no icon class will be present
    }
}

// Example usage
setCellState('box0', 'dot');
`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(codeSnippet).then(() => {
            console.log('Code copied to clipboard!');
        }).catch(err => {
            console.log('Failed to copy code: ', err);
        });
    };

    return (
        <div>
            <pre style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
                <code>
                    {codeSnippet}
                </code>
            </pre>
            <button onClick={copyToClipboard}>Copy Code</button>
        </div>
    );
};

export default CodeCopyComponent;
