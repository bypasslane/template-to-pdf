

/**
  * @module gcpUpload
  * @param {string} filePath local path to file that will be uploaded to a GCP bucket
  * @param {object} options fileName and gcp bucket data
  * @param {string} logger for logging info and errors
  * @return {string} url download link of pdf file in a GCP storage bucket
  * @example
  *
  * var gcpUpload = require('./lib/gcpUpload');
  * var options = {
  *   fileName: "newFile.pdf",
  *   gcp: {
  *     bucket: "your-gcp-bucket-name",
  *     keyFilename: "/path/to/your/gcp-keyfile.json" // optional
  *   }
  * }
  * var filePath = "./tmp/tempFile.pdf"
  * gcpUpload(filePath, options, console)
  *   .then(function (url) {
  *     console.log(url);
  *   })
  * .catch(function (error) {
  *     console.log(error);
  * })
  */

const { Storage } = require('@google-cloud/storage');

module.exports = async function upload(filePath, options, logger) {
    try {
        // Initialize GCP Storage.
        // It will use Application Default Credentials if keyFilename is not specified.
        // See: https://cloud.google.com/docs/authentication/production
        const storage = new Storage({
            keyFilename: options.gcp.keyFilename,
        });

        const bucketName = options.gcp.bucket;
        const destination = options.fileName;

        await storage.bucket(bucketName).upload(filePath, { destination });
        logger.info(`${filePath} uploaded to ${bucketName}.`);

        // Get a signed URL for the file that is valid for 15 minutes
        const signedUrlOptions = { version: 'v4', action: 'read', expires: Date.now() + 15 * 60 * 1000 };
        const [url] = await storage.bucket(bucketName).file(destination).getSignedUrl(signedUrlOptions);
        return url;
    } catch (error) {
        logger.error('Error uploading data: ', err);
        throw error;
    }
};