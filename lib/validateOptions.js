module.exports = function validateOptions(options) {
  if (typeof options !== "object" || options === null) {
    throw Error('Config param required');
  }
  if (typeof options.fileName !== "string") {
    throw Error("File Name param is required");
  }

  if (!options.fileName.includes('.pdf')) {
    throw Error("File Name param must inlcude .pdf extension");
  }

  if (options.html === undefined && options.templateOptions === undefined) {
    throw Error("Html or Template is required");
  }

  // TODO add better checking for html
  if (options.html !== undefined && options.templateOptions !== undefined) {
    throw Error("Cannot have both Html and Template");
  }

  if (options.templateOptions !== undefined) {
    if (typeof options.templateOptions.templateData !== "object" || options.templateOptions.templateData === null) {
      throw Error("Template Data is required when using Template");
    }
    if (typeof options.templateOptions.templateType !== "string" || options.templateOptions.templateType === "") {
      throw Error("Template Type is required when using Template")
    }

    if (typeof options.templateOptions.template !== "string" || options.templateOptions.template === "") {
      throw Error("Template is required when using Template")
    }
  }

  if (options.aws === undefined && options.filePath === undefined && (options.buffer === false || undefined)) {
    throw Error("filePath and or buffer is required when aws is undefined");
  }

  if (options.aws !== undefined) {
    if (options.aws.bucket === undefined) {
      throw Error("Bucket is required when using s3");
    }

    if (options.aws.bucket !== undefined && options.aws.bucket.startsWith('/')) {
      throw Error("AWS bucket cannot start with a '/'");
    }

    if (options.buffer == true) {
      throw Error("Cannot request buffer if you have aws credentials")
    }
  }

  if (options.filePath !== undefined) {
    if (!options.filePath.endsWith('/')) {
      throw Error("filePath must be absolute. I.E. i/am/absolute/")
    }
  }
}
