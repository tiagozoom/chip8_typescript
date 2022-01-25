import { Resolution } from "../shared";

interface OutputPort {
  resolution: Resolution;
  originalResolution: Resolution;
  buffer: Buffer;
  write: (data: Buffer) => void;
  createWindow: (title: string, border: boolean) => void;
  windowExists: () => boolean;
}

export default OutputPort;
