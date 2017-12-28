var del = require('del');
var Promise = require("bluebird");
var pdf = require('html-pdf');
var exec = require('child_process').exec;
var tempDir = './tmp/';
var pexec = Promise.promisify(exec);

module.exports = function generatePDF(options, templates, fileName, pdftkPath, pdftkOptions) {
  templates = [].concat(templates);

  del(tempDir + '**');

  var promises = templates.map(function (html, index) {
    return new Promise(function (resolve, reject) {
      pdf.create(html, options).toFile(tempDir + 'file-' + index + '.pdf', function (err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
  });

  return Promise.all(promises).then(function (files) {
    return merge(files, fileName, pdftkPath, pdftkOptions);
  }).catch(function (err) {
    return Promise.reject(err);
  });
};

//merge pdfs
function merge(files, fileName, pdftkPath, pdftkOptions) {
  var pdftkPath = pdftkPath || 'pdftk';

  console.log('Files: ', files);
  console.log('PDFtk Options: ', pdftkOptions);
  console.log('Function test: ', convertObjString(pdftkOptions));

  var pdfFiles = files.map(function (file) {
    return file.filename;
  }).join(' ');

  var tempMergedPath = tempDir + fileName;

  var pdfOptions = convertObjString(pdftkOptions);

  var params = [
    pdftkPath,
    pdfFiles,
    'cat output',
    tempMergedPath,
    pdfOptions
  ].join(' ');

  console.log('Params: ', params);

  return pexec(params)
    .then(function (yey) {
      return tempMergedPath;
    })
    .catch(function (error) {
      console.error('Could not merge pdf', error);
      return error;
    });
}

function convertObjString(obj) {
  return Object.keys(obj).map(function (k) {
    values = obj[k].toString().replace(/,/g, ' ');

    return ' ' + k + ' ' + values + ' ';
  }).join(' ');
}