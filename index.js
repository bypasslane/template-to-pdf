var templateCompiler = require('./lib/templateCompiler');
var pdfGenerator = require('./lib/pdfGenerator');
var awsUpload = require('./lib/awsUpload');
var saveFile = require('./lib/moveFile');
var validateOptions = require('./lib/validateOptions');
var del = require('del');

//TODO add return of blob
module.exports = function config(options) {
    return new Promise(function (resolve, reject) {
      var renderedTemplates;
      validateOptions(options);

      if (options.html) {
        renderedTemplates = options.html;
      } else {
        renderedTemplates = templateCompiler(options.templateOptions);
      }

      pdfGenerator(options.pdfOptions, renderedTemplates, options.fileName, options.pdftkPath)
        .then(function (tempFile) {
          if (options.aws) {
            awsUpload(options.aws, tempFile, options.fileName)
              .then(function (success) {
                resolve(success);
                del('./tmp/**');
              })
              .catch(function (err) {
                reject(err);
                console.error(err);
                del('./tmp/**');
                return;
              });
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
    });
};
