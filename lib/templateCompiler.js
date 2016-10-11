var Handlebars  = require('handlebars');

module.exports = function compileTemplate(options) {
  var data = [].concat(options.data);
  var renderedTemplates = [];

  data.forEach(function (dataItem) {
    renderedTemplates.push(buildTemplate(options.template, options.type, dataItem));
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
  }
}
