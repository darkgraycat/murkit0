import { IAdapter, IImage } from "./common/types";

export class Adapter implements IAdapter {
  loadImage(src: string): Promise<IImage> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const { width, height } = image;
        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0);
        const imageData = context.getImageData(0, 0, width, height);
        return resolve({ width, height, data: imageData.data.buffer });
      };
      image.onerror = (error) => {
        console.error("ADAPTER: Error loading image:", src);
        reject(error);
      };
      image.src = src;
    });
  }

  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  now(): number {
    return performance.now();
  }
}
