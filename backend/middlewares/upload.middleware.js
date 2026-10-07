const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const multer = require('multer');

const uploadDir = path.resolve(__dirname, '..', 'uploads', 'posts');
const maxFileSize = 5 * 1024 * 1024

const extensionsByMimeType = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp'
}


fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, uploadDir)
    },
    filename: (_req, file, callback) => {
        const extension = extensionsByMimeType[file.mimetype];
        callback(null, `${crypto.randomUUID()}${extension}`)
    }
})

const upload = multer({
    storage,
    limits: {
        fileSize: maxFileSize,
        files: 1
    },
    fileFilter: (_req, file, callback) => {
        const isAllowed = Object.prototype.hasOwnProperty.call(
            extensionsByMimeType,
            file.mimetype
        );

        if (!isAllowed) {
            return callback(new Error('Solo se permiten imágenes JPEG, PNG o WebP'));
        }

        callback(null, true)
    }
});

function uploadPostImage(req, res, next){
    upload.single('image')(req, res, (error) => {
        if (!error) {
            return next();
        }

        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                error: 'La imagen no puede superar los 5 MB'
            })    
        }

        return res.status(400).json({
            error: error.message || 'No se pudo procesar la imagen'
        })
    })
}

module.exports = { uploadPostImage }
