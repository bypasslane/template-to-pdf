/**
  * @module awsUpload
  * @param {string} filePath local path to file that will be uploaded to aws bucket
  * @param {object} options fileName and aws bucket data
  * @param {string} logger for logging info and errors
  * @return {string} url download link of pdf file in aws s3 bucket
  * @example
  *
  * var awsUpload = require('./lib/awsUpload');
  * var options = {
  *   s3: true,
  *   bucket: 'pdf-err/meow/baby'
  * }
  * var filePath = "./tmp/tempFile.pdf"
  * var fileName = "newFile.pdf"
  * awsUpload(options, filePath, fileName)
  *   .then(function (url) {
  *     console.log(url);
  *   })
  * .catch(function (error) {
  *     console.log(error);
  * })
  */

var AWS = require('aws-sdk');
var fs = require('fs');
var dir = './tmp/';

module.exports = function uplaod(filePath, options, logger) {
  return new Promise(function (resolve, reject) {
    AWS.config.region = options.aws.region || "us-east-1";
    var s3Bucket = new AWS.S3({ params: {Bucket: options.aws.bucket}});

    fs.readFile(filePath, function (err, data) {
      if (err) {
        logger.error('Error reading file:', err);
        reject(err);
        return;
      }
      var params = {Key: options.fileName, Bucket: options.aws.bucket, Body: data, ContentType: 'application/pdf'}
      s3Bucket.putObject(params, function(err, params){
        if (err) {
          logger.error('Error uploading data: ', err);
          reject(err);
          return;
        }

        var urlParams = {Bucket: options.aws.bucket, Key: options.fileName};
        s3Bucket.getSignedUrl('getObject', urlParams, function(err, url){
          // TODO handle error
          if (err) {
            logger.error('Error getting URL', err);
            reject(err);
            return;
          }
          resolve(url);
        });
      });
    });
  });
};
