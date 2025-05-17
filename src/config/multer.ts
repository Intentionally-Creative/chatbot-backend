// config/multer.ts
import multer from "multer";
import path from "path";
import fs from "fs";

export const AUDIO_UPLOAD_DIR = path.join(process.cwd(), "uploads", "audio");
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_AUDIO_TYPES = [
  "audio/webm",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
];
export const TITLE_MAX_LENGTH = 50;

// Ensure upload directory exists
if (!fs.existsSync(AUDIO_UPLOAD_DIR)) {
  fs.mkdirSync(AUDIO_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    //@ts-ignore
    const dir = path.join(AUDIO_UPLOAD_DIR, req.user!._id.toString());
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_, file, cb) => {
    if (SUPPORTED_AUDIO_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Only audio files are allowed. Supported types: ${SUPPORTED_AUDIO_TYPES.join(
            ", "
          )}`
        )
      );
    }
  },
}).single("audio");
