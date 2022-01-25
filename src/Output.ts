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
    for (let i = 0; i < data.length; i++) {
      const bit = data[i] ? 255 : 0;
      const x = i % 64;
      const y = Math.floor(i / 64) * 32 * 10;
      let start = y * 2560 + (x * 10 * 4);

      for (let j = 0; j < 10; j++) {
        let offset = start + (j * 2560);
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
