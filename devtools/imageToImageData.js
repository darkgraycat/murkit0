const fs = require('fs/promises');

(async (images) => {
  const imagesList = {};
  for await (const img of images) {
    const data = await fs.readFile(img);
    const buffer = Buffer.from(data);
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    const pixelDataOffset = 33; // PNG header is 33 bytes
    const pixelData = buffer.slice(pixelDataOffset);

    const pixels = [];
    for (let i = 0; i < pixelData.length; i += 4) pixels.push(pixelData.readUInt32BE(i));

    const image = {
      width: width,
      height: height,
      data: pixels,
    };
    imagesList[img] = image;
  }
  return JSON.stringify(imagesList);
})(process.argv.slice(2))
  .then(console.log)
  .catch(console.error);
