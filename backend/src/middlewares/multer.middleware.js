import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/temp");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname + "-" + Math.round(Math.random() * 1e9) + "-" + Date.now());
  },
});

export const upload = multer({ storage });
