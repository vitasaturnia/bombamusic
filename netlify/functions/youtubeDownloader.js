const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs').promises;
const path = require('path');

async function downloadAndConvert(videoUrl, outputPath) {
    const videoInfo = await ytdl.getInfo(videoUrl);
    const videoFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });

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
}

exports.handler = async function (event, context) {
    try {
        const { videoUrl } = JSON.parse(event.body);
        const fileName = `${Date.now()}.mp3`;
        const outputPath = path.resolve('public/downloads', fileName);

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
