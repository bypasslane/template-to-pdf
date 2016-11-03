var AWS = require('aws-sdk');
var fs = require('fs');
var dir = './tmp/'

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
