var fs = require('fs');
var pdf = require('html-pdf');
var Handlebars = require('handlebars');
var AWS = require('aws-sdk');
AWS.config.region = "us-east-1";
var credentials = new AWS.SharedIniFileCredentials({ profile: 's3' });
var s3Bucket = new AWS.S3( { params: {Bucket: 'pdf-err'}, credentials: credentials } )

module.exports = function templateToPDF(config) {
  validateConfig(config);
  var options = config.options || {};
  var html_array = createTemplates(config.template, config.templateType, config.templateData) //[].concat(config.html) ||
  createPDF(html_array, options)
};

function createTemplates(template, templateType, data) {
  data = [].concat(data);

  var renderedTemplates = [];

  data.forEach(function (dataItem) {
    renderedTemplates.push(buildTemplate(template, templateType, dataItem));
  })
  console.log(renderedTemplates)
  //return renderedTemplates
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

// TODO come up with filenames and folderstructure
function createPDF(html_array, options) {
  //fs.mkdirSync('temp')
  // if (html_array.length === 1) {
  //
  // }
  var num = 0
  html_array.forEach(function (html) {
    pdf.create(html, options).toFile('./temp/test-' + num + '.pdf', function(err, res) {
      if (err) return console.log(err);

      var file = fs.readFileSync('test.pdf')

      var params = {Key: 'test.pdf', Body: file, ContentType: 'application/pdf'}
    });
    num ++
  });
}

function validateConfig(config) {
  if (typeof config !== "object" || config === null) {
    throw Error('Config param required');
  }
}

//
//   // if (typeof config.filePath !== "string" || config.fileName === "") {
//   //   throw Error("File Name param is required");
//   // }
//   //
//   // // TODO add better checking for html
//   // if (config.html === undefined && config.template === undefined) {
//   //   throw Error("Html or Template is required");
//   // }
//   //
//   // // TODO add better checking for html
//   // if (config.html !== undefined && config.template !== undefined) {
//   //   throw Error("Cannot have both Html and Template");
//   // }
//   //
//   // if (config.template !== undefined) {
//   //   if (typeof config.templateData !== "object" || config.templateData === null) {
//   //     throw Error("Template Data is required when using Template");
//   //   }
//   //   if (typeof config.templateType !== "string" || config.templateType === "") {
//   //     throw Error("Template Type is required when using Template")
//   //   }
//   // }
// }


//
// // "<table><tr><th>Firstname</th><th>Lastname</th> <th>Age</th></tr><tr><td>Jill</td><td>Smith</td> <td>50</td></tr><tr><td>Eve</td><td>Jackson</td> <td>94</td></tr></table>"
//
// //var config = {filePath: '/Users/colton/Code/bypasslane/template-to-pdf/test.pdf', options: { format: 'Letter' }}
//

//var config = { filePath: 'test.pdf', options: { format: 'Letter', phantomPath: '/usr/local/bin/phantomjs', phantomArgs: [] }, template: '<p>{{basic}}</p>', templateData: { basic: 'hello world' }, templateType: 'Handlebars'}




// S3 UPLOAD
// s3Bucket.putObject(params, function(err, params){
//   if (err)
//     {
//       console.log('Error uploading data: ', err);
//     } else {
//       var urlParams = {Bucket: 'pdf-err', Key: 'test.pdf'};
//
//       s3Bucket.getSignedUrl('getObject', urlParams, function(err, url){
//         console.log('the url of the image is', url);
//       })
//     }
// });
