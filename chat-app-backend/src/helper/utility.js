const fs = require("fs");
const path = require("path");

async function saveFile(data, filePath) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path.join(__dirname, "..", filePath), data, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}

module.exports = { saveFile };