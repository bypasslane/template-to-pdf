module.exports = function validateOptions(options) {
  var isValid = true;

  if (typeof options !== "object" || options === null) {
    console.error('Config param required');
    isValid = false;
  }
  if (typeof options.fileName !== "string") {
    console.error("File Name param is required");
    isValid = false;
  }

  if(options.fileName) {
    if (!options.fileName.includes('.pdf')) {
      console.error("File Name param must inlcude .pdf extension");
      isValid = false;
    }
  }

  if (options.html === undefined && options.templateOptions === undefined) {
    console.error("Html or Template is required");
    isValid = false;
  }

  // TODO add better checking for html
  if (options.html !== undefined && options.templateOptions !== undefined) {
    console.error("Cannot have both Html and Template");
    isValid = false;
  }

  if (options.templateOptions !== undefined) {
    if (typeof options.templateOptions.templateData !== "object" || options.templateOptions.templateData === null) {
      console.error("Template Data is required when using Template");
      isValid = false;
    }
    if (typeof options.templateOptions.templateType !== "string" || options.templateOptions.templateType === "") {
      console.error("Template Type is required when using Template.  Valid options are handlebars, haml, pug, mustache, ejs");
      isValid = false;
    }

    if (typeof options.templateOptions.template !== "string" || options.templateOptions.template === "") {
      console.error("Template is required when using Template");
      isValid = false;
    }
  }

  if (options.aws === undefined && options.filePath === undefined && (options.buffer === false || undefined)) {
    console.error("filePath and or buffer is required when aws is undefined");
    isValid = false;
  }

  if (options.aws !== undefined) {
    if (options.aws.bucket === undefined) {
      console.error("Bucket is required when using s3");
      isValid = false;
    }

    if (options.aws.bucket !== undefined && options.aws.bucket.startsWith('/')) {
      console.error("AWS bucket cannot start with a '/'");
      isValid = false;
    }

    if (options.buffer == true) {
      console.error("Cannot request buffer if you have aws credentials");
      isValid = false;
    }
  }

  if (options.filePath !== undefined) {
    if (!options.filePath.endsWith('/')) {
      console.error("filePath must be absolute. I.E. i/am/absolute/");
      isValid = false;
    }
  }

  return isValid;
}
