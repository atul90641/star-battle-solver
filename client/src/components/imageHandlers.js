export const handleFileChange = (event, gridSize, handleImageUpload, setError) => {
  const file = event.target.files[0];
  if (file) {
    handleImageUpload(file, gridSize, setError);
  }
};

export const handlePaste = (event, gridSize, handleImageUpload, setError) => {
  if (gridSize === null) {
    setError('Please select a grid size first.');
    event.preventDefault();
    return;
  }

  const items = event.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const blob = items[i].getAsFile();
      handleImageUpload(blob, gridSize, setError);
      event.preventDefault();
      break;
    }
  }
};