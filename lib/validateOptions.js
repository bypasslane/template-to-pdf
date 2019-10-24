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
  var isValid = { valid: true };

  if (typeof options !== "object" || options === null) {
    isValid.message = 'Config param required';
    isValid.valid = false;
  }
  if (typeof options.fileName !== "string") {
    isValid.message = "File Name param is required";
    isValid.valid = false;
  }

  if(options.fileName) {
    if (!options.fileName.includes('.pdf')) {
      isValid.message = "File Name param must inlcude .pdf extension";
      isValid.valid = false;
    }
  }

  if (options.html === undefined && options.templateOptions === undefined) {
    isValid.message = "Html or Template is required";
    isValid.valid = false;
  }

  // TODO add better checking for html
  if (options.html !== undefined && options.templateOptions !== undefined) {
    isValid.message = "Cannot have both Html and Template";
    isValid.valid = false;
  }

  if (options.templateOptions !== undefined) {
    if (typeof options.templateOptions.templateData !== "object" || options.templateOptions.templateData === null) {
      isValid.message = "Template Data is required when using Template";
      isValid.valid = false;
    }
    if (typeof options.templateOptions.templateType !== "string" || options.templateOptions.templateType === "") {
      isValid.message = "Template Type is required when using Template.  Valid options are handlebars, haml, pug, mustache, ejs";
      isValid.valid = false;
    }

    if (typeof options.templateOptions.template !== "string" || options.templateOptions.template === "") {
      isValid.message = "Template is required when using Template";
      isValid.valid = false;
    }
  }

  if (options.aws === undefined && options.filePath === undefined && (options.buffer === false || undefined)) {
    isValid.message = "filePath and or buffer is required when aws is undefined";
    isValid.valid = false;
  }

  if (options.aws !== undefined) {
    if (options.aws.bucket === undefined) {
      isValid.message = "Bucket is required when using s3";
      isValid.valid = false;
    }

    if (options.aws.bucket !== undefined && options.aws.bucket.startsWith('/')) {
      isValid.message = "AWS bucket cannot start with a '/'";
      isValid.valid = false;
    }

    if (options.buffer == true) {
      isValid.message = "Cannot request buffer if you have aws credentials";
      isValid.valid = false;
    }
  }

  if (options.filePath !== undefined) {
    if (!options.filePath.endsWith('/')) {
      isValid.message = "filePath must be absolute. I.E. i/am/absolute/";
      isValid.valid = false;
    }
  }

  return isValid;
}
