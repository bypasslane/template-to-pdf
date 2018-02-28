/**
  * @module validateOptions
  * @param {string} options object that contains the template, template data, and template type
  * @param {string} logger for logging errors
  * @return {string} path to the file saved
  * @example
  *
  * var validateOptions = require('./lib/validateOptions');
  * var options = {
  *   fileName: "newFile.pdf",
  *   pdfOptions: {
  *    orientation: 'landscape',
  *    format: "letter",
  *    margin: '0px'
  *   },
  *   templateOptions: {
  *      template: "h1 #{message}",
  *     templateData: [{message: "Hello!"}],
  *      templateType: "pug"
  *   },
  *   html: "<h1> Hello! </h1>" #alternative to templateOptions
  *   aws: {
  *     s3: true,
  *     bucket: "pdf-err/"
  *   }
  * }
  * validateOptions(options, logger)
  *   .then(function (newFilePath) {
  *     console.log(newFilePath);
  *   })
  * .catch(function (error) {
  *     console.log(error);
  * })
  */

module.exports = function validateOptions(options, logger) {
  var isValid = true;

  if (typeof options !== "object" || options === null) {
    logger.error('Config param required');
    isValid = false;
  }
  if (typeof options.fileName !== "string") {
    logger.error("File Name param is required");
    isValid = false;
  }

  if(options.fileName) {
    if (!options.fileName.includes('.pdf')) {
      logger.error("File Name param must inlcude .pdf extension");
      isValid = false;
    }
  }

  if (options.html === undefined && options.templateOptions === undefined) {
    logger.error("Html or Template is required");
    isValid = false;
  }

  // TODO add better checking for html
  if (options.html !== undefined && options.templateOptions !== undefined) {
    logger.error("Cannot have both Html and Template");
    isValid = false;
  }

  if (options.templateOptions !== undefined) {
    if (typeof options.templateOptions.templateData !== "object" || options.templateOptions.templateData === null) {
      logger.error("Template Data is required when using Template");
      isValid = false;
    }
    if (typeof options.templateOptions.templateType !== "string" || options.templateOptions.templateType === "") {
      logger.error("Template Type is required when using Template.  Valid options are handlebars, haml, pug, mustache, ejs");
      isValid = false;
    }

    if (typeof options.templateOptions.template !== "string" || options.templateOptions.template === "") {
      logger.error("Template is required when using Template");
      isValid = false;
    }
  }

  if (options.aws === undefined && options.filePath === undefined && (options.buffer === false || undefined)) {
    logger.error("filePath and or buffer is required when aws is undefined");
    isValid = false;
  }

  if (options.aws !== undefined) {
    if (options.aws.bucket === undefined) {
      logger.error("Bucket is required when using s3");
      isValid = false;
    }

    if (options.aws.bucket !== undefined && options.aws.bucket.startsWith('/')) {
      logger.error("AWS bucket cannot start with a '/'");
      isValid = false;
    }

    if (options.buffer == true) {
      logger.error("Cannot request buffer if you have aws credentials");
      isValid = false;
    }
  }

  if (options.filePath !== undefined) {
    if (!options.filePath.endsWith('/')) {
      logger.error("filePath must be absolute. I.E. i/am/absolute/");
      isValid = false;
    }
  }

  return isValid;
}
