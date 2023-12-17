const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs').promises;
const path = require('path');

async function downloadAndConvert(videoUrl, outputPath) {
    try {
        // Fetch video information
        const videoInfo = await ytdl.getInfo(videoUrl);
        const videoFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });

        // Download and convert video to MP3
        const videoStream = ytdl(videoUrl, { format: videoFormat });
        const ffmpegCommand = ffmpeg(videoStream)
            .audioCodec('libmp3lame')
            .audioBitrate(320);

        const fileStream = fs.createWriteStream(outputPath);

        await new Promise((resolve, reject) => {
            ffmpegCommand
                .on('end', resolve)
                .on('error', reject)
                .pipe(fileStream);
        });

        return path.basename(outputPath);
    } catch (error) {
        console.error('Error in downloadAndConvert:', error);
        throw error; // Rethrow the error to be caught in the calling function
    }
}

exports.handler = async function (event, context) {
    try {
        const { videoUrl } = JSON.parse(event.body);

        // Generate a unique file name based on the video URL
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.mp3`;

        // Define the file path within the 'downloads' directory
        const outputPath = path.resolve('public/downloads', fileName);

        // Call the downloadAndConvert function to handle the download and conversion
        const savedFileName = await downloadAndConvert(videoUrl, outputPath);

        return {
            statusCode: 200,
            body: JSON.stringify({ downloadLink: `/downloads/${savedFileName}` }),
        };
    } catch (error) {
        console.error('Error in download function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};
