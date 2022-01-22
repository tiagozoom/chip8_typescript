interface OutputPort {
  buffer: Buffer;
  write: (data: Buffer) => void;
  createWindow: (title: string, border: boolean) => void;
  windowExists: () => boolean;
}

export default OutputPort;
