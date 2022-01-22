import { OutputPort, MediaLayerPort } from "./ports";

class Output implements OutputPort {
  mediaLayer: MediaLayerPort;
  buffer: Buffer;

  constructor(mediaLayer: MediaLayerPort, size: number) {
    this.buffer = Buffer.alloc(size);
    this.mediaLayer = mediaLayer;
  }

  windowExists() {
    return !this.mediaLayer.isDestroyed();
  }

  createWindow(title: string, border: boolean) {
    this.mediaLayer.createWindow(title, border);
  }

  write(data: Buffer) {
    let offset = 0;

    for (let i = 0; i < data.length; i++) {
      const bit = data[i] ? 255 : 0;
      for (let j = 0; j < 10; j++) {
        for (let k = 0; k < 10; k++) {
          this.buffer[offset++] = bit;
          this.buffer[offset++] = bit;
          this.buffer[offset++] = bit;
          this.buffer[offset++] = bit;
        }
      }
    }

    this.mediaLayer.render("argb8888", this.buffer);
  }
}

export default Output;
