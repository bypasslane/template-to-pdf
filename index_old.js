var Bluebird    = require('bluebird');
var fs          = require('fs-extra');
var exec        = require('child_process').exec;
var pdf         = require('html-pdf');
var Handlebars  = require('handlebars');
var AWS         = require('aws-sdk');
var dir         = './tmp';
var pdftkPath   = '/usr/local/bin/pdftk';

// setup AWS
// TODO grab s3 creds from init
AWS.config.region = "us-east-1";
var credentials = new AWS.SharedIniFileCredentials({ profile: 's3' });
var s3Bucket = new AWS.S3( { params: {Bucket: 'pdf-err'}, credentials: credentials } )


// promisify functions
var pexec   = Bluebird.promisify(exec);

module.exports = function templateToPDF(config) {
  validateConfig(config);

  var options = config.options || {};

  if (config.template) {
    var html_array = createTemplates(config.template, config.templateType, config.templateData)
  } else {
    var html_array = [].concat(config.html)
  }

  createPDF(html_array, options, config.fileName, config.s3, config.filePath)
};

function createTemplates(template, templateType, data) {
  data = [].concat(data);

  var renderedTemplates = [];

  data.forEach(function (dataItem) {
    renderedTemplates.push(buildTemplate(template, templateType, dataItem));
  })

  return renderedTemplates
}

function buildTemplate(template, templateType, data) {
  templateType = templateType || 'Handlebars';

  switch(templateType.toLowerCase()) {
    case 'handlebars':
      template = Handlebars.compile(template);
      return template(data);
      break;
  }
}

function createPDF(html_array, options, fileName, s3, filePath) {
  emptyTmp()

  var promises = html_array.map(function (html, index) {
    return new Promise(function (resolve, reject) {
      pdf.create(html, options).toFile('./tmp/file-' + index + '.pdf', function(err, res) {
        if (err) return reject(err);
        resolve(res);
      });
    });
  });

  Promise.all(promises).then(function(success) {
    mergePDFs(success, fileName, s3, filePath);
  }).catch(function(err) {
    console.log(err);
  });
}

function mergePDFs(files, fileName, s3, filePath) {
  var regex = new RegExp(',', 'g')
  var pdfFiles = files.map(function(file) {return file.filename;});
  var file_array = [pdftkPath, pdfFiles.toString().replace(regex,' '), 'cat output', dir + '/' + fileName].join(' ');

  pexec(file_array).then(function(success) {
    if (s3 === true) {
      uploadToS3(fileName)
    } else {
      fs.ensureDir(filePath, function (err) {
        if (err) return console.log(err)
        fs.move(dir + '/' + fileName, filePath + fileName, function (err) {
          if (err) return console.error(err)
          console.log("PDF was created at" + filePath + fileName)
          emptyTmp()
        })
      })
    }
  }).catch(function(error) {
    console.log(error)
  })
}

function uploadToS3(fileName) {
  fs.readFile(dir + '/' + fileName, function (err, data) {
    if (err) throw err;
    var params = {Key: fileName, Body: data, ContentType: 'application/pdf'}

    s3Bucket.putObject(params, function(err, params){
      if (err)
        {
          console.log('Error uploading data: ', err);
        } else {
          var urlParams = {Bucket: 'pdf-err', Key: fileName};

          s3Bucket.getSignedUrl('getObject', urlParams, function(err, url){
            console.log('the url of the image is', url);
            emptyTmp()
          })
        }
    });
  });
}

function emptyTmp() {
  fs.emptyDir(dir, function (err) {
    if (err) {
      throw err
    }
  })
}

function validateConfig(config) {
  if (typeof config !== "object" || config === null) {
    throw Error('Config param required');
  }
  if (typeof config.fileName !== "string") {
    throw Error("File Name param is required");
  }

  if (!config.fileName.includes('.pdf')) {
    throw Error("File Name param must inlcude .pdf extension");
  }

  if (config.html === undefined && config.template === undefined) {
    throw Error("Html or Template is required");
  }

  // TODO add better checking for html
  if (config.html !== undefined && config.template !== undefined) {
    throw Error("Cannot have both Html and Template");
  }

  if (config.template !== undefined) {
    if (typeof config.templateData !== "object" || config.templateData === null) {
      throw Error("Template Data is required when using Template");
    }
    if (typeof config.templateType !== "string" || config.templateType === "") {
      throw Error("Template Type is required when using Template")
    }
  }

  if (config.s3 === false && config.filePath === undefined) {
    throw Error("filePath is required when s3 is false");
  }

  if (!config.filePath.endsWith('/')) {
    throw Error("filePath must be absolute. I.E. i/am/absolute/")
  }
}


//var config = { fileName: 'some.pdf', s3: true, options: { format: 'Letter', phantomPath: '/usr/local/bin/phantomjs', phantomArgs: [] }, template: '<p>{{basic}}</p>', templateData: { basic: 'hello world' }, templateType: 'Handlebars'}
//var config = { fileName: 'some.pdf', s3: true, options: { format: 'Letter', phantomPath: '/usr/local/bin/phantomjs', phantomArgs: [] }, html: '<p>meow</p>', filePath: '/Users/colton/Desktop'}
