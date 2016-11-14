# html-template-pdf
This is the swiss army knife of html to pdf render'ers.  
**ejs**, **mustache**, **handlebars**, **pug**, or **haml** to PDF

### Use Cases

1. I have an HTML file/page that I need to convert into a pdf, save it to local filesystem, S3, or get back a buffer.

2. I have an HTML template and data written in **ejs**, **mustache**, **handlebars**, **pug**, or **haml**, and I need to make a pdf out of it, and upload it to S3 or filesystem, or buffer

**basic usage if you have pdftk installed**

`npm install html-template-pdf`

`var templateToPdf = require('html-template-pdf')`

### Save to file System

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

### Return a Buffer

```javascript
var options = {
  html: "<div><p>hello der</p></div>", 
  fileName: 'howdycolton.pdf',
  buffer = true 
}
```

### Save to s3

have your creds in `~/.aws/credentials`

structure credentials file to look like

```
[default]
aws_access_key_id = YOURACCESSKEYID
aws_secret_access_key = YOURSECRETACCESSKEY
```

```javascript
var options = {
  html: "<div><p>hello der</p></div>", 
  fileName: 'howdycolton.pdf', 
  aws: {
    s3: true, 
    bucket: 'pdf-err/meow/baby'
  }
}
```

### Support for templating

currently there is support for **Handlebars, Mustache, EJS, HAML, PUG**
Mkae sure you change the `templateType` to the template you are using.

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

### Passing in pdf options

we use the html-pdf library for pdf generation.  They accept a list of arguments for the pdf that you could optionally pass in

#### most basic pdfOPtions 

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
  },
  
  pdfOptions: {
    format: 'Letter'
  }
}
```

#### but you could get crazy
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
  },
  
  pdfOptions: {
    // Papersize Options: http://phantomjs.org/api/webpage/property/paper-size.html 
    "height": "10.5in",        // allowed units: mm, cm, in, px 
    "width": "8in",            // allowed units: mm, cm, in, px 
    - or -
    "format": "Letter",        // allowed units: A3, A4, A5, Legal, Letter, Tabloid 
    "orientation": "portrait", // portrait or landscape 
   
    // Page options 
    "border": "0",             // default is 0, units: mm, cm, in, px 
    - or -
    "border": {
      "top": "2in",            // default is 0, units: mm, cm, in, px 
      "right": "1in",
      "bottom": "2in",
      "left": "1.5in"
    },
   
    "header": {
      "height": "45mm",
      "contents": '<div style="text-align: center;">Author: Marc Bachmann</div>'
    },
    "footer": {
      "height": "28mm",
      "contents": {
        first: 'Cover page',
        2: 'Second page' // Any page number is working. 1-based index 
        default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value 
        last: 'Last Page'
      }
    },
   
   
    // Rendering options 
    "base": "file:///home/www/your-asset-path", // Base path that's used to load files (images, css, js) when they aren't referenced using a host 
   
    // Zooming option, can be used to scale images if `options.type` is not pdf 
    "zoomFactor": "1", // default is 1 
   
    // File options 
    "type": "pdf",             // allowed file types: png, jpeg, pdf 
    "quality": "75",           // only used for types png & jpeg 
   
    // Script options 
    "phantomPath": "./node_modules/phantomjs/bin/phantomjs", // PhantomJS binary which should get downloaded automatically 
    "phantomArgs": [], // array of strings used as phantomjs args e.g. ["--ignore-ssl-errors=yes"] 
    "script": '/url',           // Absolute path to a custom phantomjs script, use the file in lib/scripts as example 
    "timeout": 30000,           // Timeout that will cancel phantomjs, in milliseconds 
   
    // HTTP Headers that are used for requests 
    "httpHeaders": {
      // e.g. 
      "Authorization": "Bearer ACEFAD8C-4B4D-4042-AB30-6C735F5BAC8B"
    }
   
  }

}
```

### Note

we are using pdftk.  go to their website https://www.pdflabs.com/tools/pdftk-server/ to download.

by default we are using the command line call, but you may pass in an optional path if you are having trouble rendering a pdf
```javascript
var options = {
  html: "<div><p>hello der</p></div>",
  fileName: 'howdycolton.pdf',
  pdftkPath: '/usr/local/bin/pdftk', 
  buffer: true 
}
```

