const sharp = require('sharp');
const path = require('path');

let imageExif = async function (image) {
    const metadata = await sharp('./' + image).metadata();
    console.log(`height: ${metadata.height} width: ${metadata.width}`);
    return { height: metadata.height, width: metadata.width };
}

let imageResize = async function (image, op = false) {
    // 250px for original post, 150px for replies
    const maxSize = op ? 250 : 125;

    const thumbnail = await sharp('./' + image)
        .resize(maxSize, maxSize, {
            fit: sharp.fit.inside,
            withoutEnlargement: true
        })
        .toFormat('jpeg')
        .toFile('./uploads/' + path.parse(image).name + 's.jpg');

    console.log(thumbnail);
    return { height: thumbnail.height, width: thumbnail.width };

}

module.exports = {
    imageExif: imageExif,
    imageResize: imageResize
};