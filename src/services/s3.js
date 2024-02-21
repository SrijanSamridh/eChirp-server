const { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require("dotenv").config();

const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function getObjectUrl(key){
    const command = new GetObjectCommand({
        Bucket: "bucket.eventchirp.com",
        Key: key
    });
    const url = await getSignedUrl(s3Client, command, {expiresIn: 20});
    return url;
}

async function putObjectUrl(fileName, contentType){
    const command = new PutObjectCommand({
        Bucket: "bucket.eventchirp.com",
        Key: `uploads/user-uploads/${fileName}`,
        ContentType: contentType,
    });
    await getSignedUrl(s3Client, command);
    const url = await getObjectUrl(`uploads/user-uploads/${fileName}`);
    return url;
}

async function listObjects(){
    const command = new ListObjectsV2Command({
        Bucket: "bucket.eventchirp.com",
        Key: `/`,
    });

    const result = await s3Client.send(command);
    return result;
}

async function deleteObject(key){
    const cmd = new DeleteObjectCommand({
        Bucket: "bucket.eventchirp.com",
        Key: key
    });

    const result = await s3Client.send(cmd);
}

module.exports = { getObjectUrl, putObjectUrl, listObjects, deleteObject };
