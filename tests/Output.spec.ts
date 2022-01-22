import Output from "../src/Output";
import { MediaLayerPort, OutputPort } from "../src/ports";

class MediaLayerMock implements MediaLayerPort {
  constructor() {
    this.createWindow = jest.fn();
    this.render = jest.fn();
    this.isDestroyed = jest.fn();
  }
  createWindow(title: string, borderless: boolean): void {}
  render(mode: string, buffer: Buffer): void {}
  isDestroyed(): boolean {
    return false;
  }
}

describe("MediaLayer test suite", () => {
  let output: OutputPort;
  let mediaLayer: MediaLayerPort;

  beforeEach(() => {
    mediaLayer = new MediaLayerMock();
    output = new Output(mediaLayer, 64 * 10 * 32 * 10 * 4);
  });

  describe("", () => {
    it("write - white display", async () => {
      const buffer: Buffer = Buffer.alloc(64 * 32, 255);
      output.write(buffer);

      let offset = 0;
      expect(output.buffer[offset++]).toEqual(255);
      expect(output.buffer[offset++]).toEqual(255);
      expect(output.buffer[offset++]).toEqual(255);
      expect(output.buffer[offset++]).toEqual(255);
    });
  });
});
