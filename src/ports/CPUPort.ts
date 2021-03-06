import { Opcode } from "../shared";
import { InputPort, OutputPort, SpriteHandlerPort } from ".";
import InstructionSetPort from "./InstructionSetPort";

interface CPUPort {
  V: Uint16Array;
  I: Uint16Array;
  ST: Uint8Array;
  DT: Uint8Array;
  PC: Uint16Array;
  SP: Uint8Array;
  stack: Uint16Array;
  displayMemory: Buffer;
  input: InputPort;
  output: OutputPort;
  memory: Uint8Array;
  width: number;
  height: number;
  instructions: InstructionSetPort;
  execute: (opcode: Opcode) => void;
  clearDisplay: () => void;
  convertToOpcode: (byte: number) => Opcode;
  readCartridge: (path: string) => void;
  readNextInstruction: () => number;
  spritesHandler: SpriteHandlerPort;
}

export default CPUPort;
