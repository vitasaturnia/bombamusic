const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');

// Set the path for the ffmpeg binary
ffmpeg.setFfmpegPath(ffmpegPath);

async function downloadAndConvert(videoUrl, outputPath) {
    try {
        // Fetch video information
        const videoInfo = await ytdl.getInfo(videoUrl);

        // Choose the highest quality audio format
        const videoFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });

        // Download video stream
        const videoStream = ytdl(videoUrl, { format: videoFormat });

        // Convert video to mp3
        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(videoStream)
                .audioCodec('libmp3lame')
                .audioBitrate(320)
                .output(outputPath)
                .on('end', resolve)
                .on('error', (err) => {
                    console.error('Error in ffmpeg:', err);
                    reject(err);
                })
                .run();
        });

        return path.basename(outputPath);
    } catch (error) {
        console.error('Error in downloadAndConvert:', error);
        throw error;
    }
}

exports.handler = async function (event, context) {
    try {
        // Check if event.body is not empty
        if (!event.body) {
            console.error('Request body is empty.');
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Bad Request' }),
            };
        }

        const { videoUrl } = JSON.parse(event.body);

        // Generate a unique file name
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.mp3`;

        // Set the output path directly to the public/downloads folder
        const outputPath = path.resolve('public/downloads', fileName);

        // Perform the download and conversion
        await downloadAndConvert(videoUrl, outputPath);

        return {
            statusCode: 200,
            body: JSON.stringify({ downloadLink: `/downloads/${fileName}` }),
        };
    } catch (error) {
        console.error('Error in download function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};
