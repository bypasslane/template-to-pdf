var Handlebars  = require('handlebars');
var pug         = require('pug');
var Haml        = require('haml');
var ejs         = require('ejs');
var Mustache    = require('mustache');

module.exports = function compileTemplate(options) {
  var data = [].concat(options.templateData);
  var renderedTemplates = [];

  data.forEach(function (dataItem, index) {
    dataItem.pageNum = index + 1;
    renderedTemplates.push(buildTemplate(options.template, options.templateType, dataItem));
  });

  return renderedTemplates
};

function buildTemplate(template, templateType, data) {
  switch(templateType.toLowerCase()) {
    case 'handlebars':
      template = Handlebars.compile(template);
      return template(data);
      break;
    case 'pug':
      template = pug.compile(template);
      return template(data);
      break;
    case 'haml':
      template = Haml(template);
      return template(data);
      break;
    case 'ejs':
      template = ejs.compile(template);
      return template(data);
      break;
    case 'mustache':
      Mustache.parse(template);
      return Mustache.to_html(template, data);
      break;
  }
}
