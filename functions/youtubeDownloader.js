// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const os = require('os');
const path = require('path');

admin.initializeApp();
const storage = admin.storage();

// Set the path for the ffmpeg binary
ffmpeg.setFfmpegPath(ffmpegPath);

async function downloadAndConvert(videoUrl) {
    // ...same as your Netlify function...
}

async function uploadToFirebaseStorage(filePath, fileName) {
    // ...same as your Netlify function...
}

exports.youtubeDownloader = functions.https.onRequest(async (request, response) => {
    if (request.method !== 'POST') {
        response.status(405).send('Method Not Allowed');
        return;
    }

    try {
        const { videoUrl } = JSON.parse(request.body);
        if (!videoUrl) {
            response.status(400).send('Bad Request: No video URL provided');
            return;
        }

        const outputPath = await downloadAndConvert(videoUrl);
        const fileName = path.basename(outputPath);
        const downloadUrl = await uploadToFirebaseStorage(outputPath, fileName);

        response.status(200).send({ downloadLink: downloadUrl });
    } catch (error) {
        console.error('Error:', error);
        response.status(500).send('Internal Server Error');
    }
});
