const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs').promises;
const path = require('path');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

async function downloadAndConvert(videoUrl, outputPath) {
    try {
        console.log('Fetching video information...');
        const videoInfo = await ytdl.getInfo(videoUrl);
        console.log('Video information fetched.');

        console.log('Choosing video format...');
        const videoFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });
        console.log('Video format chosen.');

        console.log('Downloading video stream...');
        const videoStream = ytdl(videoUrl, { format: videoFormat });

        console.log('Converting video to mp3...');
        const ffmpegCommand = ffmpeg(videoStream)
            .audioCodec('libmp3lame')
            .audioBitrate(320)
            .output(outputPath);

        await new Promise((resolve, reject) => {
            ffmpegCommand.on('end', () => {
                console.log('Video conversion complete.');
                resolve();
            }).on('error', (err) => {
                console.error('Error in ffmpeg:', err);
                reject(err);
            }).run();
        });

        return path.basename(outputPath);
    } catch (error) {
        console.error('Error in downloadAndConvert:', error);
        throw error;
    }
}

exports.handler = async function (event, context) {
    try {
        console.log('Function execution started.');

        // Check if event.body is not empty
        if (!event.body) {
            console.error('Request body is empty.');
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Bad Request' }),
            };
        }

        const { videoUrl } = JSON.parse(event.body);
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.mp3`;
        const outputPath = path.resolve('/tmp', fileName); // Use /tmp as a temporary storage in Netlify Functions

        const savedFileName = await downloadAndConvert(videoUrl, outputPath);

        console.log('Moving the file to public/downloads...');
        // Move the file to the public/downloads directory
        const destinationPath = path.resolve('public/downloads', savedFileName);
        await fs.rename(outputPath, destinationPath);

        console.log('Function execution completed successfully.');

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
