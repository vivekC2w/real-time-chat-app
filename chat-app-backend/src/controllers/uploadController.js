const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/aws");

exports.uploadFile = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const fileKey = `uploads/${Date.now()}_${req.file.originalname}`;

    try {
        await s3.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileKey,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        }));

        const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${fileKey}`;
        res.json({ url: fileUrl });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
