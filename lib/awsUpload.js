/**
  * @module awsUpload
  * @param {object} options aws bucket data
  * @param {string} filePath local path to file that will be uploaded to aws bucket
  * @param {string} fileName desired file name
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

module.exports = function uplaod(options, filePath, fileName) {
  return new Promise(function (resolve, reject) {
    AWS.config.region = options.region || "us-east-1";
    var s3Bucket = new AWS.S3({ params: {Bucket: options.bucket}});

    fs.readFile(filePath, function (err, data) {
      if (err) {
        reject(err);
        console.error('error', err);
        return;
      }
      var params = {Key: fileName, Bucket: options.bucket, Body: data, ContentType: 'application/pdf'}
      s3Bucket.putObject(params, function(err, params){
        if (err) {
          console.error('Error uploading data: ', err);
          reject(err);
          return;
        }

        var urlParams = {Bucket: options.bucket, Key: fileName};
        s3Bucket.getSignedUrl('getObject', urlParams, function(err, url){
          // TODO handle error
          if (err) {
            reject(err);
            console.error('error', err);
            return;
          }
          resolve(url);
        });
      });
    });
  });
};
