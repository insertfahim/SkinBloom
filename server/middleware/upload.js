// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';

// // Ensure upload directories exist
//     const createUploadDir = (dir) => {
//     if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir, { recursive: true });
//     }
//     };

//     // Configure multer storage
//     const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         let uploadPath = 'uploads/';
//         switch (file.fieldname) {
//         case 'avatar': uploadPath += 'avatars/'; break;
//         case 'skinPhoto':
//         case 'skinPhotos': uploadPath += 'skin-photos/'; break;
//         case 'productImage': uploadPath += 'products/'; break;
//         case 'feedbackPhoto':
//         case 'feedbackPhotos': uploadPath += 'feedback/'; break;
//         case 'ticketAttachment':
//         case 'ticketAttachments': uploadPath += 'tickets/'; break;
//         default: uploadPath += 'misc/';
//         }
//         createUploadDir(uploadPath);
//         cb(null, uploadPath);
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         const ext = path.extname(file.originalname);
//         cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
//     }
//     });

//     // File filter
//     const fileFilter = (req, file, cb) => {
//     const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
//     if (allowedTypes.includes(file.mimetype)) cb(null, true);
//     else cb(new Error('Invalid file type. Only JPEG, PNG, WebP and PDF allowed.'), false);
//     };

//     export const upload = multer({
//     storage,
//     limits: { fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, files: 10 },
//     fileFilter
//     });

//     export const handleUploadError = (error, req, res, next) => {
//     if (error instanceof multer.MulterError) {
//         switch (error.code) {
//         case 'LIMIT_FILE_SIZE': return res.status(400).json({ message: 'File too large. Max 5MB.' });
//         case 'LIMIT_FILE_COUNT': return res.status(400).json({ message: 'Too many files. Max 10.' });
//         default: return res.status(400).json({ message: 'Upload error: ' + error.message });
//         }
//     } else if (error) {
//         return res.status(400).json({ message: error.message });
//     }
//     next();
//     };

//     export const deleteFile = (filePath) => {
//     if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//     };

//     export const getFileUrl = (req, filePath) => {
//     const baseUrl = `${req.protocol}://${req.get('host')}`;
//     return `${baseUrl}/${filePath}`;
// };
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/'
        
        // Check the request path to determine the upload destination
        if (req.path.includes('/profile-photo')) {
            uploadPath += 'profiles/'
        } else if (req.path.includes('/skin-photo')) {
            uploadPath += 'consultation/'
        } else {
            // Fallback to fieldname-based logic
            switch (file.fieldname) {
                case 'photo':
                case 'avatar': 
                    uploadPath += 'profiles/'; 
                    break
                case 'skinPhoto':
                case 'skinPhotos': 
                    uploadPath += 'consultation/'; 
                    break
                case 'productImage': 
                    uploadPath += 'products/'; 
                    break
                case 'feedbackPhoto':
                case 'feedbackPhotos': 
                    uploadPath += 'feedback/'; 
                    break
                case 'ticketAttachment':
                case 'ticketAttachments': 
                    uploadPath += 'tickets/'; 
                    break
                default: 
                    uploadPath += 'misc/'
            }
        }
        ensureDir(uploadPath)
        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const ext = path.extname(file.originalname)
        cb(null, `${file.fieldname}-${unique}${ext}`)
    }
})

const allowed = new Set([
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'
])

const fileFilter = (req, file, cb) => {
    if (allowed.has(file.mimetype)) return cb(null, true)
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP and PDF allowed.'), false)
}

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: Number(process.env.MAX_FILE_SIZE || 5 * 1024 * 1024), // 5MB
        files: 10
    }
})

export function handleUploadError(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' })
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({ message: 'Too many files. Maximum is 10 files.' })
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({ message: 'Unexpected file field.' })
            default:
                return res.status(400).json({ message: 'Upload error: ' + err.message })
        }
    } else if (err) {
        return res.status(400).json({ message: err.message })
    }
    next()
}
