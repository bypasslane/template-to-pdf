var del = require('del');
var Promise = require("bluebird");
var pdf = require('html-pdf');
var exec = require('child_process').exec;
var tempDir = './tmp/';
var pexec = Promise.promisify(exec);

module.exports = function generatePDF(options, templates, fileName, pdftkPath) {
  templates = [].concat(templates);

  del(tempDir + '**');

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
    return merge(files, fileName, pdftkPath);
  }).catch(function(err) {
    return Promise.reject(err)
  });
};

//merge pdfs
function merge(files, fileName, pdftkPath) {
  var pdftkPath = pdftkPath || 'pdftk'
  var pdfFiles = files.map(function (file) { return file.filename; }).join(' ');
  var tempMergedPath = tempDir + fileName;
  var params = [
    pdftkPath,
    pdfFiles,
    'cat output',
    tempMergedPath
  ].join(' ');

  return pexec(params)
    .then(function (yey) {
      return tempMergedPath;
    })
    .catch(function (error) {
      console.error('Could not merge pdf', error);
      return error;
    });
}
