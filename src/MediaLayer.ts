import sdl from "@kmamal/sdl";
import { MediaLayerPort } from "./ports";
import { Resolution } from "./shared";

class MediaLayer implements MediaLayerPort {
  private window: any;
  private resolution: Resolution;

  constructor(resolution: Resolution) {
    this.resolution = resolution;
  }

  createWindow(title: string, borderless: boolean) {
    this.window = sdl.video.createWindow({
      title,
      width: this.resolution.width,
      height: this.resolution.height,
      borderless,
    });
  }

  render(mode: string, buffer: Buffer) {
    this.window.render(this.resolution.width, this.resolution.height, this.resolution.stride, mode, buffer);
  }

  isDestroyed(): boolean {
    return this.window.destroyed;
  }
}

export default MediaLayer;
