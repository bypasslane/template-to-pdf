/**
  * @module generatePDF
  * @param {object} options pdf paperSize options
  * @see http://phantomjs.org/api/webpage/property/paper-size.html
  * @param {array} templates rendered html templates
  * @param {string} fileName desired file name
  * @param {string} pdftkPath path to pdftk
  * @return {string} path to the file generated
  * @example
  *
  * var generatePDF = require('./lib/generatePDF');
  * var options = {
  *   orientation: 'landscape',
  *   format: "letter",
  *   margin: '0px'
  * };
  * var templates = [];
  * var fileName = "newFile.pdf";
  * var pdftkPath = "usr/local/bin/pdftk";
  * generatePDF(options, templates, fileName, pdftkPath)
  *   .then(function (url) {
  *     console.log(url);
  *   })
  * .catch(function (error) {
  *     console.log(error);
  * })
  */

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
  console.log("ABOUT TO DELTE TMP");
  return del([tempDir + '**'])
    .then(() => fs.mkdirSync(tempDir))
    .then(() => templates.map((html, index) => convertToPdf(html, index, options)))
    .then(promises => Promise.all(promises))
    .then(files => merge(files, fileName, pdftkPath))
};

function convertToPdf(html, index, options) {
  console.log("CONVERTING...")
	return new Promise((resolve, reject) => {
		conversion({ html: html, paperSize: { orientation: 'landscape', format: "letter", margin: '0px' } }, function (err, pdf) {
			if (err) {
				reject(err);
				return;
			}
      var tmpFileName = tempDir + 'file-' + index + '.pdf';
			var output = fs.createWriteStream(tmpFileName)
			pdf.stream.pipe(output);
			resolve(output.path);
		});
	})
}

//merge pdfs
function merge(files, fileName, pdftkPath) {
  console.log("IN MERGE")
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
      console.log("MERGED")
      return tempMergedPath;
    })
    .catch(function (error) {
      console.error('Could not merge pdf', error);
      return error;
    });
}
