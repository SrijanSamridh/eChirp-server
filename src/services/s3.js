const { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require("dotenv").config();

// Initialize the S3 client with AWS credentials from environment variables
const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

/**
 * Get a signed URL for accessing an object in the S3 bucket
 * @param {string} key - The key of the object in the S3 bucket
 * @returns {string} - The signed URL for accessing the object
 */
async function getObjectUrl(key) {
    try {
        const command = new GetObjectCommand({
            Bucket: "bucket.eventchirp.com",
            Key: key
        });
        const url = await getSignedUrl(s3Client, command, { expiresIn: 20 });
        return url;
    } catch (error) {
        console.error("Error getting signed URL for object:", error);
        throw error;
    }
}

/**
 * Upload an object to the S3 bucket and get a signed URL for accessing it
 * @param {string} fileName - The name of the file to be uploaded
 * @param {string} contentType - The content type of the file
 * @returns {string} - The signed URL for accessing the uploaded object
 */
async function putObjectUrl(fileName, contentType) {
    try {
        const command = new PutObjectCommand({
            Bucket: "bucket.eventchirp.com",
            Key: `uploads/user-uploads/${fileName}`,
            ContentType: contentType,
        });
        await s3Client.send(command);
        const url = await getObjectUrl(`uploads/user-uploads/${fileName}`);
        return url;
    } catch (error) {
        console.error("Error putting object to S3 and getting signed URL:", error);
        throw error;
    }
}

/**
 * List objects in the S3 bucket
 * @returns {object} - Result object containing information about the listed objects
 */
async function listObjects() {
    try {
        const command = new ListObjectsV2Command({
            Bucket: "bucket.eventchirp.com",
            Key: `/`,
        });
        const result = await s3Client.send(command);
        return result;
    } catch (error) {
        console.error("Error listing objects in S3 bucket:", error);
        throw error;
    }
}

/**
 * Delete an object from the S3 bucket
 * @param {string} key - The key of the object to be deleted
 */
async function deleteObject(key) {
    try {
        const cmd = new DeleteObjectCommand({
            Bucket: "bucket.eventchirp.com",
            Key: key
        });
        await s3Client.send(cmd);
    } catch (error) {
        console.error("Error deleting object from S3 bucket:", error);
        throw error;
    }
}

module.exports = { getObjectUrl, putObjectUrl, listObjects, deleteObject };
