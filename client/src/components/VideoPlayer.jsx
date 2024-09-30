import React from 'react';

const VideoPlayer = () => {
    const videoUrl = "video.mp4"; // Replace with your video file URL

    // Function to handle the button click and redirect to new tab
    const handleButtonClick = () => {
        window.open(videoUrl, '_blank'); // Open video in a new tab
    };

    return (
        <div>
            <button  className='button3' onClick={handleButtonClick}>
                How to use
            </button>
        </div>
    );
};

export default VideoPlayer;
