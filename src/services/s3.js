const { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: 'AKIA2PEHVGMVT5OMD4CQ',
        secretAccessKey: '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'
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
    const url = await getSignedUrl(s3Client, command);
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
