var del = require('del');
var Promise = require("bluebird");
var pdf = require('html-pdf');
var exec = require('child_process').exec;
var tempDir = './tmp/';
var pexec = Promise.promisify(exec);


module.exports = function generatePDF(options, templates, filename) {
  templates = [].concat(templates);


  // empty tmp dir
  del(tempDir+'**');

  var promises = templates.map(function (html, index) {
    return new Promise(function (resolve, reject) {
      pdf.create(html, options).toFile(tempDir+'file-' + index + '.pdf', function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
  });


  return Promise.all(promises).then(function(files) {
    mergePDFs(files, fileName);
  }).catch(function(err) {
    console.error('Could not generate pdf', err);
  });
};



function merge(files) {
  var pdfFiles = files.map(function (file) { return file.filename; }).join(' ');
  var tempMergedPath = tempDir + fileName;
  var params = [
    pdftkPath,
    pdfFiles,
    'cat output',
    tempMergedPath
  ].join(' ');

  return pexec(params)
    .then(function () {
      return tempMergedPath;
    })
    .catch(function (error) {
      console.error('Could not merge pdf', error);
      return error;
    });
}
