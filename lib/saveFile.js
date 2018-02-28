/**
  * @module saveFile
  * @param {string} tempFile rendered html templates
  * @param {string} filePath desired file name
  * @param {string} fileName path to pdftk
  * @return {string} path to the file saved
  * @example
  *
  * var saveFile = require('./lib/saveFile');
  * var tempFile = "./tmp/tempFile.pdf";
  * var filePath = "./pdf-files/";
  * var fileName = "newFile.pdf";
  * saveFile(options, templates, fileName, pdftkPath)
  *   .then(function (newFilePath) {
  *     console.log(newFilePath);
  *   })
  * .catch(function (error) {
  *     console.log(error);
  * })
  */

var fs = require('fs')

module.exports = function save(tempFile, filePath, fileName) {
  return new Promise(function (resolve, reject) {
    fs.mkdir(filePath, function (err) {
      if (err) {
        reject(err)
        console.error(err)
        return;
      }
      fs.rename(tempFile, filePath + fileName, function (err) {
        if (err) {
          reject(err)
          console.error(err)
          return;
        }
        resolve(filePath + fileName)
      })
    })
  });
};
