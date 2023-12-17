// Import required modules
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { tmpdir } from 'os';
import { join } from 'path';

// Set the path for the ffmpeg binary
ffmpeg.setFfmpegPath(ffmpegPath.path);

// Firebase Admin Initialization
const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('ascii'));
const firebaseConfig = {
    credential: cert(serviceAccount),
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET
};
initializeApp(firebaseConfig);

const storage = getStorage();

// Function to download and convert video
async function downloadAndConvert(videoUrl) {
    const videoInfo = await ytdl.getInfo(videoUrl);
    const videoFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });
    const videoStream = ytdl(videoUrl, { format: videoFormat });
    const outputPath = join(tmpdir(), `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.mp3`);

    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(videoStream)
            .audioCodec('libmp3lame')
            .audioBitrate(320)
            .output(outputPath)
            .on('end', () => resolve(outputPath))
            .on('error', reject)
            .run();
    });
}

// Function to upload file to Firebase Storage
async function uploadToFirebaseStorage(filePath, fileName) {
    const bucket = storage.bucket();
    await bucket.upload(filePath, { destination: fileName });
    const [url] = await bucket.file(fileName).getSignedUrl({
        action: 'read',
        expires: '03-09-2491' // Set an appropriate expiry date
    });
    return url;
}

// Netlify function handler
export async function handler(event) {
    if (!event.body) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Bad Request: No body found' }) };
    }

    try {
        const { videoUrl } = JSON.parse(event.body);
        if (!videoUrl) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Bad Request: No video URL provided' }) };
        }

        const outputPath = await downloadAndConvert(videoUrl);
        const fileName = outputPath.split('/').pop();
        const downloadUrl = await uploadToFirebaseStorage(outputPath, fileName);

        return { statusCode: 200, body: JSON.stringify({ downloadLink: downloadUrl }) };
    } catch (error) {
        console.error('Error in download function:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};
