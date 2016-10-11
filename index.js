var templateCompiler = require('./lib/templateCompiler');
var pdfGenerator = require('./lib/pdfGenerator');
var awsUpload = require('./lib/awsUpload');
var moveFile = require('./lib/moveFile');
var validateOptions = require('./lib/validateOptions');
var del = require('del');

module.exports = function config(options) {
    return new Promise(function (resolve, reject) {
      var renderedTemplates;
      validateOptions(options);

      if (options.html) {
        renderedTemplates = options.html;
      } else {
        renderedTemplates = templateCompiler(options.templateOptions);
      }

      pdfGenerator(options.pdfOptions, renderedTemplates, options.fileName)
        .then(function (tempFile) {
          if (options.aws) {
            awsUpload(options.aws, tempFile, options.fileName)
              .then(function (success) {
                console.log(success);
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
            moveFile(tempFile, options.filePath, options.fileName)
              .then(function (success) {
                console.log(success);
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
