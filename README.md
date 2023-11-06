# Template to PDF

Module that converts html to a PDF file.

### Support for templating

Currently there is support for **Handlebars, Mustache, EJS, HAML, PUG**.
Make sure you change the `templateType` to the template you are using.

```javascript
var options = {
  templateOptions: {
    template: '<p>{{basic}}</p>',
    templateData: { basic: 'hello world' },
    templateType: 'Handlebars'
  },
  aws: {
    s3: true,
    bucket: 'pdf-err/meow/baby'
  }
}
```

### Usage

Download and install `pdftk`. https://www.pdflabs.com/tools/pdftk-server/

`npm install html-template-pdf`

`var templateToPdf = require('html-template-pdf')`

```javascript
var options = {
  html: "<div><p>hello der</p></div>",
  fileName: 'howdycolton.pdf',
  filePath: '/Users/myname/Desktop/baaay/'
}

templatetoPdf(options)
  .then(function(resp){
    console.log(resp);
  })
  .catch(function(err){
    console.log(err);
  });
```

### Saving options:

**Save to file System**
```javascript
  fileName: 'howdycolton.pdf',
  filePath: '/Users/myname/Desktop/baaay/'
```

**Return a Buffer**
```javascript
  buffer = true
```

**Save to s3**
```javascript
  aws: {
    s3: true,
    bucket: 'pdf-err/meow/baby'
  }
```

Requires AWS credentials in `~/.aws/credentials`.
```
[default]
aws_access_key_id = YOURACCESSKEYID
aws_secret_access_key = YOURSECRETACCESSKEY
```

### Passing in pdf options

We use the phantom-html-to-pdf library for pdf generation.  
They accept a list of arguments for the pdf that you could optionally pass in.

**Basic pdfOPtions**
```javascript
var options = {
  html: "<div><p>hello der</p></div>",
  fileName: 'howdycolton.pdf',
  filePath: '/Users/myname/Desktop/baaay/'
  pdfOptions: {
    orientation: 'landscape',
    format: "letter",
    margin: '0px'
  }
}
```

More Papersize options: http://phantomjs.org/api/webpage/property/paper-size.html

### Note

If on MAC OSX 10.11 use this https://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/pdftk_server-2.02-mac_osx-10.11-setup.pkg version of pdftk as there have been issues reported with 10.11.

By default we are using the command line call for pdftk,
but you may pass in an optional path if you are having trouble rendering a pdf.
```javascript
var options = {
  html: "<div><p>hello der</p></div>",
  fileName: 'howdycolton.pdf',
  pdftkPath: '/usr/local/bin/pdftk',
  buffer: true
}
```

#### Table of Contents

-   [template-to-pdf](#template-to-pdf)
-   [compileTemplate](#compiletemplate)
-   [generatePDF](#generatepdf)
-   [awsUpload](#awsupload)
-   [saveFile](#savefile)
-   [validateOptions](#validateoptions)

### template-to-pdf

**Parameters**

-   `data` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** an object that contains the template/html, fileName, and AWS configurations.

**Examples**

```javascript
var templateToPDF = require('template-to-pdf');

var data = {
  fileName: "newFile.pdf",
  pdfOptions: {
   orientation: 'landscape',
   format: "letter",
   margin: '0px'
  },
  templateOptions: {
     template: "h1 #{message}",
    templateData: [{message: "Hello!"}],
     templateType: "pug"
  },
  html: "<h1> Hello! </h1>" #alternative to templateOptions
  aws: {
    s3: true,
    bucket: "pdf-err/"
  }
}

templateToPDF(data)
  .then(function (downloadLink) {
    console.log(downloadLink);
  })
.catch(function (error) {
    console.log(error);
})
```

Returns **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** an object that contains the download link for the pdf generated

### compileTemplate

**Parameters**

-   `options` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** object that contains the template, template data, and template type

**Examples**

```javascript
var compileTemplate = require('./lib/compileTemplate');
var options = {
  template: "h1 #{message}",
  templateData: [{message: "Hello!"}],
  templateType: "pug"
}
compileTemplate(options)
  .then(function (renderedTemplates) {
    console.log(renderedTemplates);
  })
.catch(function (error) {
    console.log(error);
})
```

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** path to the file saved

### generatePDF

-   **See: <http://phantomjs.org/api/webpage/property/paper-size.html>**

**Parameters**

-   `options` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** pdf paperSize options
-   `templates` **[array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** rendered html templates
-   `fileName` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** desired file name
-   `pdftkPath` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** path to pdftk

**Examples**

```javascript
var generatePDF = require('./lib/generatePDF');
var options = {
  orientation: 'landscape',
  format: "letter",
  margin: '0px'
};
var templates = [];
var fileName = "newFile.pdf";
var pdftkPath = "usr/local/bin/pdftk";
generatePDF(options, templates, fileName, pdftkPath)
  .then(function (url) {
    console.log(url);
  })
.catch(function (error) {
    console.log(error);
})
```

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** path to the file generated

### awsUpload

**Parameters**

-   `options` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** aws bucket data
-   `filePath` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** local path to file that will be uploaded to aws bucket
-   `fileName` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** desired file name

**Examples**

```javascript
var awsUpload = require('./lib/awsUpload');
var options = {
  s3: true,
  bucket: 'pdf-err/meow/baby'
}
var filePath = "./tmp/tempFile.pdf"
var fileName = "newFile.pdf"
awsUpload(options, filePath, fileName)
  .then(function (url) {
    console.log(url);
  })
.catch(function (error) {
    console.log(error);
})
```

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** url download link of pdf file in aws s3 bucket

### saveFile

**Parameters**

-   `tempFile` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** rendered html templates
-   `filePath` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** desired file name
-   `fileName` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** path to pdftk

**Examples**

```javascript
var saveFile = require('./lib/saveFile');
var tempFile = "./tmp/tempFile.pdf";
var filePath = "./pdf-files/";
var fileName = "newFile.pdf";
saveFile(options, templates, fileName, pdftkPath)
  .then(function (newFilePath) {
    console.log(newFilePath);
  })
.catch(function (error) {
    console.log(error);
})
```

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** path to the file saved

### validateOptions

**Parameters**

-   `options` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** object that contains the template, template data, and template type

**Examples**

```javascript
var validateOptions = require('./lib/validateOptions');
var options = {
  fileName: "newFile.pdf",
  pdfOptions: {
   orientation: 'landscape',
   format: "letter",
   margin: '0px'
  },
  templateOptions: {
     template: "h1 #{message}",
    templateData: [{message: "Hello!"}],
     templateType: "pug"
  },
  html: "<h1> Hello! </h1>" #alternative to templateOptions
  aws: {
    s3: true,
    bucket: "pdf-err/"
  }
}
validateOptions(options)
  .then(function (newFilePath) {
    console.log(newFilePath);
  })
.catch(function (error) {
    console.log(error);
})
```

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** path to the file saved
