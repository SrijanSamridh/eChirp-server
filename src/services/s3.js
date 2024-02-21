const S3 = require("@aws-sdk/client-s3");
const Presigner = require("@aws-sdk/s3-request-presigner");
require("dotenv").config();

const s3Client = new S3({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const presigner = new Presigner({ client: s3Client });

// Function for generating a presigned URL to GET an object
async function getObjectUrl(key) {
    try {
        const command = new S3.GetObjectCommand({
            Bucket: "bucket.eventchirp.com",
            Key: key
        });
        const url = await presigner.presignGetObject(command, { expiresIn: 20 });
        return url;
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        throw error; // Re-throw for proper handling
    }
}

// Function for uploading a file and returning its presigned URL
async function putObjectUrl(fileName, contentType) {
    try {
        const command = new S3.PutObjectCommand({
            Bucket: "bucket.eventchirp.com",
            Key: `uploads/user-uploads/${fileName}`,
            ContentType: contentType,
        });
        await presigner.presignPutObject(command);
        const url = await getObjectUrl(`uploads/user-uploads/${fileName}`);
        return url;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error; // Re-throw for proper handling
    }
}

// Function for listing objects in the S3 bucket
async function listObjects() {
    try {
        const command = new S3.ListObjectsV2Command({
            Bucket: "bucket.eventchirp.com",
            Prefix: "", // Use Prefix for more flexibility
        });
        const result = await s3Client.send(command);
        return result;
    } catch (error) {
        console.error("Error listing objects:", error);
        throw error; // Re-throw for proper handling
    }
}

// Function for deleting an object
async function deleteObject(key) {
    try {
        const command = new S3.DeleteObjectCommand({
            Bucket: "bucket.eventchirp.com",
            Key: key
        });
        const result = await s3Client.send(command);
        return result; // Return result for confirmation
    } catch (error) {
        console.error("Error deleting object:", error);
        throw error; // Re-throw for proper handling
    }
}

module.exports = { getObjectUrl, putObjectUrl, listObjects, deleteObject };
