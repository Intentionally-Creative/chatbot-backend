// config/multer.ts
import multer from "multer";
import path from "path";
import fs from "fs";

export const AUDIO_UPLOAD_DIR = path.join(process.cwd(), "uploads", "audio");

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

export const uploadMiddleware = multer({ storage }).single("audio");

// export const uploadMiddleware = multer({
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
//   fileFilter: (_req, file, cb) => cb(null, /^audio\//.test(file.mimetype)),
// }).single("audio");
