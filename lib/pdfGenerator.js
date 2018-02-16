var fs = require('fs');
var del = require('del');
var Promise = require("bluebird");
var exec = require('child_process').exec;
var tempDir = './tmp/';
var pexec = Promise.promisify(exec);
var conversion = require("phantom-html-to-pdf")({
  timeout: 1000000,
	phantomPath: require("phantomjs2").path,
  tmpDir: tempDir
});

module.exports = function generatePDF(options, templates, fileName, pdftkPath) {
  templates = [].concat(templates);
  return del([tempDir + '**'])
    .then(() => fs.mkdirSync(tempDir))
    .then(() => templates.map((html, index) => convertToPdf(html, index)))
    .then(promises => {
      conversion.kill();
      return promises;
    })
    .then(promises => Promise.all(promises))
    .then(files => merge(files, fileName, pdftkPath))
};

function convertToPdf(html, index) {
	return new Promise((resolve, reject) => {
		conversion({ html: html, paperSize: options }, function (err, pdf) {
			if (err) {
				reject(err);
				return;
			}
      var tmpFileName = tempDir + 'file-' + index + '.pdf';
			var output = fs.createWriteStream(tmpFileName)
			pdf.stream.pipe(output);
			resolve(output.path);
		});
	});
}

//merge pdfs
function merge(files, fileName, pdftkPath) {
  var pdftkPath = pdftkPath || 'pdftk'
  var pdfFiles = files.join(' ');
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
