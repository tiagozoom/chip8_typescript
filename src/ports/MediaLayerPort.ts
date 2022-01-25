import { Resolution } from "../shared";

export type Window = {
  destroyed: boolean;
  render: (resolution: Resolution, format: string, data: Buffer) => void;
};

interface MediaLayerPort {
  createWindow: (title: string, borderless: boolean) => void;
  render: (mode: string, buffer: Buffer) => void;
  isDestroyed: () => boolean;
}

export default MediaLayerPort;
