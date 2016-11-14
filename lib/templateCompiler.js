var Handlebars  = require('handlebars');
var pug         = require('pug');

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
  templateType = templateType || 'Handlebars';

  switch(templateType.toLowerCase()) {
    case 'handlebars':
      template = Handlebars.compile(template);
      return template(data);
      break;
    case 'pug':
      template = pug.compile(template);
      return template(data);
      break;
  }
}
