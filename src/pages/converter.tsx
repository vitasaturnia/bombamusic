import React, { useState } from 'react';

const DownloadPage = () => {
    const [videoUrl, setVideoUrl] = useState('');
    const [downloadLink, setDownloadLink] = useState('');
    const [error, setError] = useState('');

    const handleVideoUrlChange = (event) => {
        setVideoUrl(event.target.value);
    };

    const handleDownload = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch('/.netlify/functions/youtubeDownloader', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ videoUrl }),
            });

            if (response.ok) {
                const { downloadLink } = await response.json();
                setDownloadLink(downloadLink);
                setError('');
            } else {
                const { error } = await response.json();
                setError(error || 'Failed to fetch download link');
            }
        } catch (error) {
            console.error('Error fetching download link:', error);
            setError('Error fetching download link');
        }
    };

    return (
        <div>
            <h1>YouTube to MP3 Downloader</h1>
            <form onSubmit={handleDownload}>
                <label>
                    YouTube Video URL:
                    <input type="text" value={videoUrl} onChange={handleVideoUrlChange} />
                </label>
                <button type="submit">Download MP3</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {downloadLink && (
                <div>
                    <p>Download Link:</p>
                    <a href={downloadLink} download>
                        Download MP3
                    </a>
                </div>
            )}
        </div>
    );
};

export default DownloadPage;
