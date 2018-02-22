/**
  * @section Documentation
  * @module template-to-pdf
  * @param {object} data an object that contains the template/html, fileName, and AWS configurations.
  * @return {object} an object that contains the download link for the pdf generated
  * @example
  *
  * var templateToPDF = require('template-to-pdf');
  *
  * var data = {
  *   fileName: "newFile.pdf",
  *   pdfOptions: {
  *    orientation: 'landscape',
  *    format: "letter",
  *    margin: '0px'
  *   },
  *   templateOptions: {
  *      template: "h1 #{message}",
  *     templateData: [{message: "Hello!"}],
  *      templateType: "pug"
  *   },
  *   html: "<h1> Hello! </h1>" #alternative to templateOptions
  *   aws: {
  *     s3: true,
  *     bucket: "pdf-err/"
  *   }
  * }
  *
  * templateToPDF(data)
  *   .then(function (downloadLink) {
  *     console.log(downloadLink);
  *   })
  * .catch(function (error) {
  *     console.log(error);
  * })
  */

var templateCompiler = require('./lib/templateCompiler');
var pdfGenerator = require('./lib/pdfGenerator');
var awsUpload = require('./lib/awsUpload');
var saveFile = require('./lib/saveFile');
var validateOptions = require('./lib/validateOptions');
var fs = require('fs')
var del = require('del');

module.exports = function config(options) {
  console.log("IN TEMPLATE TO PDF");
    return new Promise(function (resolve, reject) {
      var renderedTemplates;
      if (validateOptions(options) === false ) {
        reject("Malformed Options");
        return;
      };

      if (options.html) {
        renderedTemplates = options.html;
      } else {
        renderedTemplates = templateCompiler(options.templateOptions);
      }
      console.log("ABOUT TO GENERATE PDF");
      pdfGenerator(options.pdfOptions, renderedTemplates, options.fileName, options.pdftkPath)
        .then(function (tempFile) {
          console.log("DONE GENERATING")
          if (options.aws) {
            console.log("UPLOADING TO AWS")
            awsUpload(options.aws, tempFile, options.fileName)
              .then(function (success) {
                console.log("DONE UPLOADING")
                resolve(success);
                del('./tmp/**');
              })
              .catch(function (err) {
                reject(err);
                console.error(err);
                del('./tmp/**');
                return;
              });
          } else if (options.buffer === true) {
            //return a buffer
            fs.readFile(tempFile, function (err, data) {
              if (err) {
                reject(err);
                console.error('error', err);
                return;
              }
              resolve(data)
              del('./tmp/**');
            })
          } else {
            saveFile(tempFile, options.filePath, options.fileName)
              .then(function (success) {
                resolve(success);
                del('./tmp/**');
              })
              .catch(function (err) {
                reject(err)
                del('./tmp/**');
                console.error(err);
                return;
              })
          }
        })
        .catch(function (err) {
          reject(err)
          del('./tmp/**');
          console.error(err);
          return;
        })
    })
    .catch(function (error) {
      console.error('Error: ', error);
      return error;
    });;
};
