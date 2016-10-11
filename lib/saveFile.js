var fs = require('fs-extra')

module.exports = function save(tempFile, filePath, fileName) {
  return new Promise(function (resolve, reject) {
    fs.ensureDir(filePath, function (err) {
      if (err) {
        reject(err)
        console.error(err)
        return;
      }
      fs.move(tempFile, filePath + fileName, function (err) {
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
