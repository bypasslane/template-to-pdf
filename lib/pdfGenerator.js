var fs = require('fs');
var del = require('del');
var Promise = require("bluebird");
var pdf = require('phantom-html-to-pdf');
var exec = require('child_process').exec;
var tempDir = './tmp/';
var pexec = Promise.promisify(exec);
var conversion = require("phantom-html-to-pdf")({
	phantomPath: require("phantomjs2").path,
  tmpDir: tempDir
});

module.exports = function generatePDF(options, templates, fileName, pdftkPath) {
  templates = [].concat(templates);

  del(tempDir + '**');
  fs.mkdirSync(tempDir);

  var promises = templates.map(function (html, index) {
    return new Promise(function (resolve, reject) {
      conversion({ html: html, paperSize: {orientation: 'landscape', format: "letter", margin: '0px'}  }, function(err, pdf) {
        if (err) {
          reject(err);
          return;
        }
        resolve(pdf.stream.path);
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
