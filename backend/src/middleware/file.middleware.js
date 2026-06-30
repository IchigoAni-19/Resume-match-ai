import multer from "multer";

/**
 * Multer instance configured to accept resume file uploads.
 *
 * - Storage: in-memory (`memoryStorage`) so the buffer can be passed directly
 *   to `pdf2json` without writing to disk.
 * - Limit: 5 MB max file size. Multer throws a `MulterError` with code
 *   `LIMIT_FILE_SIZE` if exceeded, which the global error handler in `app.js`
 *   will catch and return as a 400/413 response.
 *
 * Usage: `upload.single("resume")` as route middleware.
 */
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 5, // 5 MB
    },
});

export default upload;
