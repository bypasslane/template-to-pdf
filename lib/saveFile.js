var fs = require('fs')

module.exports = function save(tempFile, filePath, fileName) {
  return new Promise(function (resolve, reject) {
    fs.mkdir(filePath, function (err) {
      if (err) {
        reject(err)
        console.error(err)
        return;
      }
      fs.rename(tempFile, filePath + fileName, function (err) {
        if (err) {
          reject(err)
          console.error(err)
          return;
        }
        resolve(filePath + fileName)
      })
    })
  });
};
