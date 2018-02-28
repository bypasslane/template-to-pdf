/**
  * @module generatePDF
  * @param {object} options includes filename, pdf paperSize options, pdftkPath(optional)
  * @see http://phantomjs.org/api/webpage/property/paper-size.html
  * @param {array} templates rendered html templates
  * @param {string} newLogger for logging info and errors
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
  numberOfWorkers: 10,
  timeout: 1000000,
	phantomPath: require("phantomjs2").path,
  tmpDir: tempDir
});
var logger = console;

module.exports = function generatePDF(options, templates, newLogger) {
  logger = newLogger;
  templates = [].concat(templates);
  logger.info("Converting " + options.fileName + " html files to pdfs");
  var startTime = Date.now();
  return Promise.all(templates.map((html, index) => convertToPdf(html, index, options)))
    .then(files => {
      logger.info("Done converting " + options.fileName + " html files");
      logger.info("Time spent converting " + options.fileName + " html files:", Date.now() - startTime);
      return merge(files, options.fileName, options.pdftkPath)
    })
    .catch(function (error) {
      logger.error('Error generating pdf:', error);
      return error;
    });
};

function convertToPdf(html, index, options) {
  // logger.info("Converting " + options.fileName + " html file:", index);
  // var startTime = Date.now();
	return new Promise((resolve, reject) => {
		conversion({ html: html, paperSize: { orientation: 'landscape', format: "letter", margin: '0px' } }, function (err, pdf) {
			if (err) {
				reject(err);
				return;
			}
      // var tmpFileName = tempDir + 'file-' + index + options.fileName + '.pdf';
			// var output = fs.createWriteStream(tmpFileName);
			// pdf.stream.pipe(output);
      // logger.info("Done converting " + options.fileName + " html file:", index);
			resolve(pdf.stream.path);
		});
	})
  .catch(function (error) {
    logger.error("Conversion Error on file " + options.fileName + ":", error);
    return error;
  });
  // .finally(() => {
  //   logger.info("Time spent converting " + options.fileName + " html file " +index+ " :", Date.now() - startTime);
  // });
}

//merge pdfs
function merge(files, fileName, pdftkPath) {
  logger.info("Merging files");
  var pdftkPath = pdftkPath || 'pdftk';
  var pdfFiles = files.join(' ');
  var tempMergedPath = tempDir + fileName;
  var params = [
    pdftkPath,
    pdfFiles,
    'cat output',
    tempMergedPath
  ].join(' ');
  var startTime = Date.now();
  return pexec(params)
    .then(() => {
      logger.info("Merge succssfull, now removing temporary files");
      return pexec('rm '+pdfFiles);
    })
    .then(() => {
      logger.info("Temporary files removed");
      return tempMergedPath;
    })
    .catch(error => {
      logger.error('Could not merge pdf:', error);
      return error;
    })
    .finally(() => {
      logger.info("Time spent merging files:", Date.now() - startTime);
    });
}
