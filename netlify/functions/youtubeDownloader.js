const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs').promises;
const path = require('path');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

async function downloadAndConvert(videoUrl, outputPath) {
    try {
        const videoInfo = await ytdl.getInfo(videoUrl);
        const videoFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });
        const videoStream = ytdl(videoUrl, { format: videoFormat });

        const ffmpegCommand = ffmpeg()
            .input(videoStream)
            .audioCodec('libmp3lame')
            .audioBitrate(320)
            .outputFormat('mp3')
            .output(outputPath);

        await new Promise((resolve, reject) => {
            ffmpegCommand.on('end', resolve).on('error', reject).run();
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
            throw new Error('Request body is empty');
        }

        const { videoUrl } = JSON.parse(event.body);
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.mp3`;
        const outputPath = path.resolve('/tmp', fileName); // Use /tmp as a temporary storage in Netlify Functions

        const savedFileName = await downloadAndConvert(videoUrl, outputPath);

        // Move the file to the public/downloads directory
        const destinationPath = path.resolve('public/downloads', savedFileName);
        await fs.rename(outputPath, destinationPath);

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
