import InstructionSet from "./InstructionSet";
import {
  CPUPort,
  InputPort,
  InstructionSetPort,
  OutputPort,
  SpriteHandlerPort,
} from "./ports";
import { Opcode, SpritePositionTable } from "./shared";
import InstructionObject from "./shared/types/InstructionObject";

class CPU implements CPUPort {
  stack: Uint16Array = new Uint16Array(0x10);
  V: Uint16Array = new Uint16Array(0x10);
  I: Uint16Array = new Uint16Array(0x1);
  ST: Uint8Array = new Uint8Array(0x1);
  DT: Uint8Array = new Uint8Array(0x1);
  PC: Uint16Array = new Uint16Array(0x1);
  SP: Uint8Array = new Uint8Array(0x1);
  width: number;
  height: number;
  displayMemory: Buffer;
  memory: Uint8Array = new Uint8Array(0x400);
  input: InputPort;
  output: OutputPort;
  instructions: InstructionSetPort;
  instructionTable: InstructionObject;
  spritePositions: { [key: number]: number };
  spritesHandler: SpriteHandlerPort;

  constructor(
    width: number,
    height: number,
    input: InputPort,
    output: OutputPort,
    spritesHandler: SpriteHandlerPort
  ) {
    this.input = input;
    this.output = output;
    this.height = height;
    this.width = width;
    this.displayMemory = Buffer.alloc(width * height, 0);
    this.memory = Buffer.alloc(0x600, 0);
    this.PC[0] = 0;
    this.instructions = new InstructionSet(this);
    this.spritesHandler = spritesHandler;
    this.spritePositions = this.initializeSprites();
    this.instructionTable = {
      0x0: this.instructions.inst_0x0,
      0x1: this.instructions.inst_0x1,
      0x2: this.instructions.inst_0x2,
      0x3: this.instructions.inst_0x3,
      0x4: this.instructions.inst_0x4,
      0x5: this.instructions.inst_0x5,
      0x6: this.instructions.inst_0x6,
      0x7: this.instructions.inst_0x7,
      0x8: this.instructions.inst_0x8,
      0x9: this.instructions.inst_0x9,
      0xa: this.instructions.inst_0xA,
      0xb: this.instructions.inst_0xB,
      0xc: this.instructions.inst_0xC,
      0xd: this.instructions.inst_0xD,
      0xe: this.instructions.inst_0xE,
      0xf: this.instructions.inst_0xF,
    };
  }

  convertToOpcode(byte: number): Opcode {
    const opcode: Opcode = {
      address: byte >> 12,
      nnn: byte & 0x0fff,
      n: byte & 0x000f,
      x: (byte >> 8) & 0x0f,
      y: (byte >> 4) & 0x00f,
      kk: byte & 0x00ff,
    };
    return opcode;
  }

  initializeSprites(): SpritePositionTable {
    const spritesTable = this.spritesHandler.getSpriteTable();
    const spritePositions: SpritePositionTable = {};
    let offset = 0;
    for (let i = 0; i < spritesTable.length; i++) {
      spritePositions[i] = offset;
      for (let j = 0; j < spritesTable[i].length; j++) {
        this.memory[offset++] = spritesTable[i][j];
      }
    }

    return spritePositions;
  }

  clearDisplay() {
    let offset = 0;
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        this.displayMemory[offset] = 0;
      }
    }
  }

  execute(opcode: Opcode) {
    this.instructionTable[opcode.address](opcode);
    this.PC[0] += 2;
  }
}

export default CPU;
