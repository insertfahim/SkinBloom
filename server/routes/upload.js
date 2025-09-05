import express from 'express';
import { upload, handleUploadError } from '../middleware/upload.js';
import { authRequired } from '../middleware/auth.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Profile photo upload
router.post('/profile-photo', authRequired, upload.single('photo'), handleUploadError, (req, res) => {
    try {
        console.log('Profile photo upload request received')
        console.log('User:', req.user)
        console.log('File:', req.file)
        
        if (!req.file) {
            console.log('No file in request')
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log('File details:', {
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            destination: req.file.destination,
            path: req.file.path
        })

        // Generate the public URL for the uploaded file (including the profiles subdirectory)
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const photoUrl = `${baseUrl}/uploads/profiles/${req.file.filename}`;

        console.log('Generated photo URL:', photoUrl)

        const response = {
            message: 'Photo uploaded successfully',
            photoUrl: photoUrl,
            filename: req.file.filename
        }

        console.log('Sending response:', response)
        res.json(response);
    } catch (error) {
        console.error('Profile photo upload error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

// Skin photo upload (for analysis)
router.post('/skin-photo', authRequired, upload.single('photo'), handleUploadError, (req, res) => {
    try {
        console.log('Skin photo upload request received')
        console.log('User:', req.user)
        console.log('File:', req.file)
        
        if (!req.file) {
            console.log('No file in request')
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log('File details:', {
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            destination: req.file.destination,
            path: req.file.path
        })

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const photoUrl = `${baseUrl}/uploads/consultation/${req.file.filename}`;

        console.log('Generated photo URL:', photoUrl)

        const response = {
            message: 'Consultation photo uploaded successfully',
            photoUrl: photoUrl,
            filename: req.file.filename
        }

        console.log('Sending response:', response)
        res.json(response);
    } catch (error) {
        console.error('Skin photo upload error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

// Multiple photos upload
router.post('/multiple', authRequired, upload.array('photos', 10), handleUploadError, (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const photoUrls = req.files.map(file => ({
            url: `${baseUrl}/uploads/${path.basename(file.path)}`,
            filename: file.filename,
            originalName: file.originalname
        }));

        res.json({
            message: 'Photos uploaded successfully',
            photos: photoUrls
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

// Delete uploaded file
router.delete('/:filename', authRequired, (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(process.cwd(), 'uploads', filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ message: 'File deleted successfully', filename });
        } else {
            res.status(404).json({ message: 'File not found' });
        }
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Delete failed', error: error.message });
    }
});

// Get file info
router.get('/info/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(process.cwd(), 'uploads', filename);

        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            res.json({
                filename,
                size: stats.size,
                createdAt: stats.birthtime,
                modifiedAt: stats.mtime
            });
        } else {
            res.status(404).json({ message: 'File not found' });
        }
    } catch (error) {
        console.error('File info error:', error);
        res.status(500).json({ message: 'Failed to get file info', error: error.message });
    }
});

export default router;