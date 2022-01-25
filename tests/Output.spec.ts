import Output from "../src/Output";
import { MediaLayerPort, OutputPort } from "../src/ports";
import { Resolution } from "../src/shared";

class MediaLayerMock implements MediaLayerPort {
  constructor() {
    this.createWindow = jest.fn();
    this.render = jest.fn();
    this.isDestroyed = jest.fn();
  }
  createWindow(title: string, borderless: boolean): void { }
  render(mode: string, buffer: Buffer): void { }
  isDestroyed(): boolean {
    return false;
  }
}

describe("MediaLayer test suite", () => {
  let output: OutputPort;
  let mediaLayer: MediaLayerPort;

  beforeEach(() => {
    mediaLayer = new MediaLayerMock();
  });

  describe("Displaying data on a 640 * 320 screen", () => {
    it("write - 2x2 to 4x4", async () => {
      const resolution = { width: 4, height: 4, stride: 1 } as Resolution
      const originalResolution = { width: 2, height: 2, stride: 1 } as Resolution
      output = new Output(mediaLayer, resolution, originalResolution);
      const buffer: Buffer = Buffer.alloc(2 * 2, 0);

      buffer[3] = 255
      output.write(buffer);

      expect(output.buffer[0]).toEqual(0);
      expect(output.buffer[1]).toEqual(0);

      expect(output.buffer[2]).toEqual(0);
      expect(output.buffer[3]).toEqual(0);

      expect(output.buffer[4]).toEqual(0);
      expect(output.buffer[5]).toEqual(0);

      expect(output.buffer[6]).toEqual(0);
      expect(output.buffer[7]).toEqual(0);

      expect(output.buffer[8]).toEqual(0);
      expect(output.buffer[9]).toEqual(0);

      expect(output.buffer[10]).toEqual(255);
      expect(output.buffer[11]).toEqual(255);

      expect(output.buffer[12]).toEqual(0);
      expect(output.buffer[13]).toEqual(0);

      expect(output.buffer[14]).toEqual(255);
      expect(output.buffer[15]).toEqual(255);
    });

    it("write - 2x2 to 2x2 with stride of 2", async () => {
      const resolution = { width: 2, height: 2, stride: 2 } as Resolution
      const originalResolution = { width: 2, height: 2, stride: 1 } as Resolution
      output = new Output(mediaLayer, resolution, originalResolution);
      const buffer: Buffer = Buffer.alloc(2 * 2, 0);

      buffer[3] = 255
      output.write(buffer);

      expect(output.buffer[0]).toEqual(0);
      expect(output.buffer[1]).toEqual(0);

      expect(output.buffer[2]).toEqual(0);
      expect(output.buffer[3]).toEqual(0);

      expect(output.buffer[4]).toEqual(0);
      expect(output.buffer[5]).toEqual(0);

      expect(output.buffer[6]).toEqual(255);
      expect(output.buffer[7]).toEqual(255);
    });
  });
});
