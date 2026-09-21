import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Automatically create directories if they don't exist to prevent server crashes
const audioDir = 'uploads/audio/';
const imageDir = 'uploads/images/';
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

// Define storage settings
const storage = multer.diskStorage({
    destination(req, file, cb) {
        if (file.fieldname === 'audio') {
            cb(null, audioDir);
        } else if (file.fieldname === 'image') {
            cb(null, imageDir);
        } else {
            cb(new Error('Invalid field name'), false);
        }
    },
    filename(req, file, cb) {
        // Example output: 1695420342-song.mp3
        cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
    }
});

// Create the multer instance
export const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max file size
});