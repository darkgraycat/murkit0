const fs = require('fs/promises');

// TODO: fix
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
    for (let i = 0; i < pixelData.length; i += 4) {
      const [r, g, b, a] = [
        pixelData[i + 0],
        pixelData[i + 1],
        pixelData[i + 2],
        pixelData[i + 2],
      ]
      const pixel =  (a << 24) | (b << 16) | (g << 8) | r;
      pixels.push(pixel);
    }

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
