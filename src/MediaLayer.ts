import sdl from "@kmamal/sdl";
import { MediaLayerPort } from "./ports";

class MediaLayer implements MediaLayerPort {
  private window: any;
  private width: number;
  private height: number;
  private stride: number;

  constructor(width: number, height: number, stride: number) {
    this.width = width;
    this.height = height;
    this.stride = stride;
  }

  createWindow(title: string, borderless: boolean) {
    this.window = sdl.video.createWindow({
      title,
      width: this.width,
      height: this.height,
      borderless,
    });
  }

  render(mode: string, buffer: Buffer) {
    this.window.render(this.width, this.height, this.stride, mode, buffer);
  }

  isDestroyed(): boolean {
    return this.window.destroyed;
  }
}

export default MediaLayer;
