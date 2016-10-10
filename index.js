var templateCompiler = require('/lib/templateCompiler');
var pdfGenerator = require('/lib/pdfGenerator');
var awsUpload = require('/lib/awsUpload');

module.exports = function config(config) {
  config = config || {};

  return function (options) {
    return promise(function (resolve, reject) {
      var renderedTemplates;
      validateOptions(options);

      if (options.html) {
        renderedTemplates = options.html;
      } else {
        renderedTemplates = templateCompiler(options.templateOptions);
      }

      pdfGenerator(options.pdfOptions, renderedTemplate, options.filename).then(function (tempFile) {
        if (config.aws) {
          awsUpload(config.aws, tempPDFFile, options.filename)
            .then(resolve)
            .catch(reject);
        }
      })
      .then(resolve)
      .catch(reject);
    });
  };
};


// TODO add other pdf options
// pdfOptions = {
//   pageSize: 'a4'
// }

// templateOptions = {
//   tempalte: '',
//   type: '',
//   data: ''
// }




function validateOptions(options) {
  if (typeof options !== "object" || options === null) {
    throw Error('Config param required');
  }
  if (typeof options.fileName !== "string") {
    throw Error("File Name param is required");
  }

  if (!options.fileName.includes('.pdf')) {
    throw Error("File Name param must inlcude .pdf extension");
  }

  if (options.html === undefined && options.template === undefined) {
    throw Error("Html or Template is required");
  }

  // TODO add better checking for html
  if (options.html !== undefined && options.template !== undefined) {
    throw Error("Cannot have both Html and Template");
  }

  if (options.template !== undefined) {
    if (typeof options.templateData !== "object" || options.templateData === null) {
      throw Error("Template Data is required when using Template");
    }
    if (typeof options.templateType !== "string" || options.templateType === "") {
      throw Error("Template Type is required when using Template")
    }
  }

  if (options.s3 === false && options.filePath === undefined) {
    throw Error("filePath is required when s3 is false");
  }

  if (!options.filePath.endsWith('/')) {
    throw Error("filePath must be absolute. I.E. i/am/absolute/")
  }
}
