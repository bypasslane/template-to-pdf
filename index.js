var templateCompiler = require('./lib/templateCompiler');
var pdfGenerator = require('./lib/pdfGenerator');
var awsUpload = require('./lib/awsUpload');
var saveFile = require('./lib/saveFile');
var validateOptions = require('./lib/validateOptions');
var fs = require('fs')
var del = require('del');

module.exports = function config(options) {
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
    });
};
