import { OutputPort, MediaLayerPort } from "./ports";
import MediaLayer from "./MediaLayer";

class Output implements OutputPort {
  mediaLayer: MediaLayerPort;
  buffer: Buffer;

  constructor() {
    this.buffer = Buffer.alloc(64 * 32 * 4);
    this.mediaLayer = new MediaLayer(64 * 10, 32 * 10, 64 * 4);
  }

  isDestroyed() {
    return this.mediaLayer.isDestroyed();
  }

  createWindow() {
    this.mediaLayer.createWindow("Teste", true);
  }

  write(data: Buffer) {
    let offset = 0;
    for (let i = 0; i < data.length; i++) {
      const bit = data[i] ? 255 : 0;
      for (let j = 0; j < 10; j++) {
        for (let k = 0; k < 10; k++) {
          this.buffer[offset++] = bit;
        }
      }
    }

    this.mediaLayer.render("argb8888", this.buffer);
  }
}

export default Output;
