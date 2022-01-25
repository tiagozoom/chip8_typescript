import { OutputPort, MediaLayerPort } from "./ports";
import { Resolution } from "./shared";

class Output implements OutputPort {
  mediaLayer: MediaLayerPort;
  buffer: Buffer;
  resolution: Resolution;
  originalResolution: Resolution;

  constructor(mediaLayer: MediaLayerPort, resolution: Resolution, originalResolution: Resolution) {
    this.mediaLayer = mediaLayer;
    this.resolution = resolution;
    this.originalResolution = originalResolution;
    this.buffer = Buffer.alloc(resolution.width * resolution.height * resolution.stride);
  }

  windowExists() {
    return !this.mediaLayer.isDestroyed();
  }

  createWindow(title: string, border: boolean) {
    this.mediaLayer.createWindow(title, border);
  }

  write(data: Buffer) {
    const wDiff = this.resolution.width / this.originalResolution.width;
    const hDiff = this.resolution.height / this.originalResolution.height;

    for (let i = 0; i < data.length; i++) {
      const bit = data[i] ? 255 : 0;

      const x = (i % this.originalResolution.width) * wDiff * this.resolution.stride;
      const y = Math.floor(i / this.originalResolution.width) * this.originalResolution.height;
      let start = (y * this.resolution.width * this.resolution.stride) + x;

      console.log(start)

      for (let j = 0; j < wDiff; j++) {
        let offset = start + (j * this.resolution.width * this.resolution.stride);
        for (let k = 0; k < hDiff; k++) {
          for (let f = 0; f < this.resolution.stride; f++) this.buffer[offset++] = bit;
        }
      }
    }

    this.mediaLayer.render("argb8888", this.buffer);
  }
}

export default Output;
