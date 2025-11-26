import multer from 'multer';
import path from 'path';

// Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // 'uploads/' folder mein files save hongi.
        // Yeh folder automatically nahi banta, aapko khud banana padega.
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // File ka naam unique banane ke liye timestamp aur original extension use kiya
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Multer Middleware Initialization
export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Optional: File size limit 5MB
    fileFilter: (req, file, cb) => {
        // Optional: Sirf images allow karna
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed!'), false);
        }
    }
});

// export default upload;