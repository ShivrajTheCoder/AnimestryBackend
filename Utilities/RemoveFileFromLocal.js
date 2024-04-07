const fs = require('fs');

const removeFileFromLocal = (image, otherimages) => {
    fs.unlinkSync(image[0].path);
    if (otherimages?.length > 0) {
        otherimages.forEach((otherimage) => {
            fs.unlinkSync(otherimage.path);
        });
    }
}

module.exports = removeFileFromLocal;
