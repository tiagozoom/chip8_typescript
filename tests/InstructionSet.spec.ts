import InstructionSet from "../src/InstructionSet";
import {
  CPUPort,
  InputPort,
  InstructionSetPort,
  OutputPort,
  SpriteHandlerPort,
} from "../src/ports";
import { Opcode, SpritePositionTable } from "../src/shared";

class InputMock implements InputPort {
  read() {
    return "";
  }
}

class OutputMock implements OutputPort {
  buffer: Buffer;
  constructor() {
    this.buffer = Buffer.alloc(0)
  }
  createWindow(title: string, border: boolean) { };
  windowExists() { return true };
  write(data: Buffer) { }
}

class SpritesHandlerMock implements SpriteHandlerPort {
  getSpriteTable(): number[][] {
    return [[0xf0, 0x90, 0x90, 0x90, 0xf0]];
  }
}

class CPUMock implements CPUPort {
  displayMemory: Buffer;
  stack: Uint16Array = new Uint16Array(0x10);
  V: Uint16Array = new Uint16Array(0x10);
  I: Uint16Array = new Uint16Array(0x1);
  ST: Uint8Array = new Uint8Array(0x1);
  DT: Uint8Array = new Uint8Array(0x1);
  PC: Uint16Array = new Uint16Array(0x1);
  SP: Uint8Array = new Uint8Array(0x1);
  input: InputPort;
  output: OutputPort;
  memory: Uint8Array;
  width: number;
  height: number;
  instructions: InstructionSetPort;
  execute(opcode: Opcode) { }
  spritePositions: SpritePositionTable;
  spritesHandler: SpriteHandlerPort;
  clearDisplay() { }
  initialize() { }
  convertToOpcode(byte: number): Opcode {
    return {} as Opcode;
  }
  initializeSprites(): SpritePositionTable {
    return {};
  }

  constructor() {
    this.input = new InputMock();
    this.output = new OutputMock();
    this.height = 64;
    this.width = 32;
    this.displayMemory = Buffer.alloc(this.width * this.height, 0);
    this.memory = Buffer.alloc(0x600, 0);
    this.PC[0] = 0;
    this.instructions = new InstructionSet(this);
    this.execute = jest.fn();
    this.clearDisplay = jest.fn();
    this.initializeSprites = jest.fn();
    this.spritePositions = { 0x0: 0x10 };
    this.spritesHandler = new SpritesHandlerMock();
  }
  readCartridge(path: string) { };
  readNextInstruction() { return 1 };
}

describe("#InstructionSet test suite", () => {
  let instructionSet: InstructionSetPort;
  let cpuMock: CPUPort;

  beforeEach(() => {
    cpuMock = new CPUMock();
    instructionSet = new InstructionSet(cpuMock);
  });

  describe("0x0 Instruction family", () => {
    it("00E0 - Clear the display.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0,
        nnn: 0x200,
        x: 0,
        y: 0,
        kk: 0xe0,
      };

      instructionSet.inst_0x0(opcodeMock);

      expect(cpuMock.clearDisplay).toHaveBeenCalledTimes(1);
    });

    it("00EE - Return from a subroutine.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0,
        nnn: 0x200,
        x: 0,
        y: 0,
        kk: 0xee,
      };

      cpuMock.stack[0] = 0x1;
      cpuMock.stack[1] = 0x100;
      cpuMock.SP[0] = 1;

      instructionSet.inst_0x0(opcodeMock);

      expect(cpuMock.PC[0]).toEqual(0x100);
      expect(cpuMock.SP[0]).toEqual(0);
    });
  });

  describe("0x1 Instruction family", () => {
    it("1nnn - Jump to location nnn.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0,
        nnn: 0x200,
        x: 0,
        y: 0,
        kk: 0,
      };

      instructionSet.inst_0x1(opcodeMock);

      expect(cpuMock.PC[0]).toEqual(0x200);
    });
  });

  describe("0x2 Instruction family", () => {
    it("2nnn - Call subroutine at nnn.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0,
        nnn: 0x200,
        x: 0,
        y: 0,
        kk: 0,
      };

      cpuMock.PC[0] = 0x10;

      instructionSet.inst_0x2(opcodeMock);

      expect(cpuMock.SP[0]).toEqual(1);
      expect(cpuMock.stack[0]).toEqual(0x10);
      expect(cpuMock.PC[0]).toEqual(0x200);
    });
  });

  describe("0x3 Instruction family", () => {
    it("3xkk - Skip next instruction Vx === kk.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0,
        nnn: 0x200,
        x: 1,
        y: 0,
        kk: 0x10,
      };

      cpuMock.PC[0] = 1;
      cpuMock.V[1] = 0x10;

      instructionSet.inst_0x3(opcodeMock);

      expect(cpuMock.PC[0]).toEqual(3);
    });

    it("3xkk - Don't Skip next instruction Vx !== kk.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0,
        nnn: 0x200,
        x: 1,
        y: 0,
        kk: 0x20,
      };

      cpuMock.PC[0] = 1;
      cpuMock.V[1] = 0x10;

      instructionSet.inst_0x3(opcodeMock);

      expect(cpuMock.PC[0]).toEqual(1);
    });
  });

  describe("0x4 Instruction family", () => {
    it("4xkk - Skip next instruction Vx !== kk.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0,
        nnn: 0x200,
        x: 1,
        y: 0,
        kk: 0x20,
      };

      cpuMock.PC[0] = 1;
      cpuMock.V[1] = 0x10;

      instructionSet.inst_0x4(opcodeMock);

      expect(cpuMock.PC[0]).toEqual(3);
    });

    it("4xkk - Don't Skip next instruction Vx === kk.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0,
        nnn: 0x200,
        x: 1,
        y: 0,
        kk: 0x10,
      };

      cpuMock.PC[0] = 1;
      cpuMock.V[1] = 0x10;

      instructionSet.inst_0x4(opcodeMock);

      expect(cpuMock.PC[0]).toEqual(1);
    });
  });

  describe("0x5 Instruction family", () => {
    it("5xkk - Skip next instruction Vx === Vy.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 0x20,
      };

      cpuMock.PC[0] = 1;
      cpuMock.V[0] = 0x10;
      cpuMock.V[1] = 0x10;

      instructionSet.inst_0x5(opcodeMock);

      expect(cpuMock.PC[0]).toEqual(3);
    });

    it("5xkk - Don't Skip next instruction Vx !== kk.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 0x10,
      };

      cpuMock.PC[0] = 1;
      cpuMock.V[0] = 0x10;
      cpuMock.V[1] = 0x20;

      instructionSet.inst_0x5(opcodeMock);

      expect(cpuMock.PC[0]).toEqual(1);
    });
  });

  describe("0x6 Instruction family", () => {
    it("6xkk - Set Vx = kk.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 0x20,
      };

      instructionSet.inst_0x6(opcodeMock);

      expect(cpuMock.V[0]).toEqual(0x20);
    });
  });

  describe("0x7 Instruction family", () => {
    it("7xkk - Set Vx = Vx + kk.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 20,
      };
      cpuMock.V[0] = 10;

      instructionSet.inst_0x7(opcodeMock);

      expect(cpuMock.V[0]).toEqual(30);
    });
  });

  describe("0x8 Instruction family", () => {
    it("8xy0 - Set Vx = Vy.  ", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 20,
      };
      cpuMock.V[0] = 10;
      cpuMock.V[1] = 20;

      instructionSet.inst_0x8(opcodeMock);

      expect(cpuMock.V[0]).toEqual(20);
    });

    it("8xy1 - Set Vx = Vx OR Vy.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 1,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 0,
      };
      cpuMock.V[0] = 10;
      cpuMock.V[1] = 5;

      instructionSet.inst_0x8(opcodeMock);

      expect(cpuMock.V[0]).toEqual(0xf);
    });

    it("8xy2 - Set Vx = Vx AND Vy.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 2,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 0,
      };
      cpuMock.V[0] = 10;
      cpuMock.V[1] = 3;

      instructionSet.inst_0x8(opcodeMock);

      expect(cpuMock.V[0]).toEqual(2);
    });

    it("8xy3 - Set Vx = Vx XOR Vy.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 3,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 0,
      };
      cpuMock.V[0] = 10;
      cpuMock.V[1] = 3;

      instructionSet.inst_0x8(opcodeMock);

      expect(cpuMock.V[0]).toEqual(9);
    });

    it("8xy4 - Set Vx = Vx + Vy, set VF = carry.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 4,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 0,
      };
      cpuMock.V[0] = 0xff;
      cpuMock.V[1] = 0xff;

      instructionSet.inst_0x8(opcodeMock);

      expect(cpuMock.V[0]).toEqual(0xfe);
      expect(cpuMock.V[0xf]).toEqual(1);
    });

    it("8xy5 - Set Vx = Vx - Vy, set VF = NOT borrow.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 5,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 0,
      };
      cpuMock.V[0] = 0x1;
      cpuMock.V[1] = 0xff;

      instructionSet.inst_0x8(opcodeMock);

      expect(cpuMock.V[0]).toEqual(0xff02);
      expect(cpuMock.V[0xf]).toEqual(0);
    });

    it("8xy5 - Set Vx = Vx - Vy, set VF = 1 borrow.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 5,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 0,
      };
      cpuMock.V[0] = 0xff;
      cpuMock.V[1] = 0x1;

      instructionSet.inst_0x8(opcodeMock);

      expect(cpuMock.V[0]).toEqual(0xfe);
      expect(cpuMock.V[0xf]).toEqual(1);
    });

    it("8xy6 - Set Vx = Vx SHR 1.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 6,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 0,
      };
      cpuMock.V[0] = 10;

      instructionSet.inst_0x8(opcodeMock);

      expect(cpuMock.V[0]).toEqual(5);
      expect(cpuMock.V[0xf]).toEqual(0);
    });

    it("8xy6 - Set Vx = Vx SHR 1 VF = 1", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 6,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 0,
      };
      cpuMock.V[0] = 15;

      instructionSet.inst_0x8(opcodeMock);

      expect(cpuMock.V[0]).toEqual(7);
      expect(cpuMock.V[0xf]).toEqual(1);
    });

    it("8xy7 - Set Vx = Vy - Vx, set VF = NOT borrow.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 7,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 0,
      };
      cpuMock.V[0] = 0xff;
      cpuMock.V[1] = 0x1;

      instructionSet.inst_0x8(opcodeMock);

      expect(cpuMock.V[0]).toEqual(0xff02);
      expect(cpuMock.V[0xf]).toEqual(0);
    });

    it("8xy7 - Set Vx = Vy - Vx, set VF = borrow.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 7,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 0,
      };
      cpuMock.V[0] = 0x1;
      cpuMock.V[1] = 0xff;

      instructionSet.inst_0x8(opcodeMock);

      expect(cpuMock.V[0]).toEqual(0xfe);
      expect(cpuMock.V[0xf]).toEqual(1);
    });

    it("8xyE - Set Vx = Vx SHL 1.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0xe,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 0,
      };
      cpuMock.V[0] = 5;

      instructionSet.inst_0x8(opcodeMock);

      expect(cpuMock.V[0]).toEqual(10);
      expect(cpuMock.V[0xf]).toEqual(0);
    });

    it("8xyE - Set Vx = Vx SHL 1 set VF = 1", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0xe,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 0,
      };
      cpuMock.V[0] = 0xf000;

      instructionSet.inst_0x8(opcodeMock);

      expect(cpuMock.V[0]).toEqual(0xe000);
      expect(cpuMock.V[0xf]).toEqual(1);
    });
  });

  describe("0x9 Instruction family", () => {
    it("9xy0 - Skip next instruction if Vx != Vy.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0xe,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 0,
      };

      cpuMock.PC[0] = 1;
      cpuMock.V[0] = 10;
      cpuMock.V[1] = 5;

      instructionSet.inst_0x9(opcodeMock);

      expect(cpuMock.PC[0]).toEqual(3);
    });

    it("9xy0 - Do not skip next instruction if Vx === Vy.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0xe,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 0,
      };

      cpuMock.PC[0] = 1;
      cpuMock.V[0] = 10;
      cpuMock.V[1] = 10;

      instructionSet.inst_0x9(opcodeMock);

      expect(cpuMock.PC[0]).toEqual(1);
    });
  });

  describe("0xA Instruction family", () => {
    it("Annn - Set I = nnn.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0xe,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 0,
      };

      cpuMock.I[0] = 0;

      instructionSet.inst_0xA(opcodeMock);

      expect(cpuMock.I[0]).toEqual(0x200);
    });
  });

  describe("0xB Instruction family", () => {
    it("Bnnn - Jump to location nnn + V0.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0xe,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 0,
      };

      cpuMock.V[0] = 10;
      cpuMock.PC[0] = 0;

      instructionSet.inst_0xB(opcodeMock);

      expect(cpuMock.PC[0]).toEqual(0x20a);
    });
  });

  describe("0xC Instruction family", () => {
    it("Cnnn - Set Vx = random byte AND kk.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0xe,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 0xffff,
      };

      cpuMock.V[0] = 10;

      instructionSet.inst_0xC(opcodeMock);

      expect(cpuMock.V[0]).toBeLessThan(0xffff);
    });
  });

  describe("0xD Instruction family", () => {
    it("Dnnn - Display n-byte sprite starting at memory location I at (Vx, Vy), with no collision.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 5,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 0,
      };

      cpuMock.V[0xf] = 1;
      cpuMock.V[0] = 0;
      cpuMock.V[1] = 0;
      cpuMock.I[0] = 0x200;

      {
        let offset = 0;
        for (let i = 0; i < cpuMock.width; i++) {
          for (let j = 0; j < cpuMock.height; j++) {
            cpuMock.displayMemory[offset++] = 0;
          }
        }
      }

      cpuMock.memory[0x200] = 0xf0;
      cpuMock.memory[0x201] = 0x90;
      cpuMock.memory[0x202] = 0x90;
      cpuMock.memory[0x203] = 0x90;
      cpuMock.memory[0x204] = 0xf0;

      instructionSet.inst_0xD(opcodeMock);

      expect(cpuMock.displayMemory[0]).toEqual(1);
      expect(cpuMock.displayMemory[1]).toEqual(1);
      expect(cpuMock.displayMemory[2]).toEqual(1);
      expect(cpuMock.displayMemory[3]).toEqual(1);
      expect(cpuMock.displayMemory[4]).toEqual(0);
      expect(cpuMock.displayMemory[5]).toEqual(0);
      expect(cpuMock.displayMemory[6]).toEqual(0);
      expect(cpuMock.displayMemory[7]).toEqual(0);

      expect(cpuMock.displayMemory[64]).toEqual(1);
      expect(cpuMock.displayMemory[65]).toEqual(0);
      expect(cpuMock.displayMemory[66]).toEqual(0);
      expect(cpuMock.displayMemory[67]).toEqual(1);
      expect(cpuMock.displayMemory[68]).toEqual(0);
      expect(cpuMock.displayMemory[69]).toEqual(0);
      expect(cpuMock.displayMemory[70]).toEqual(0);
      expect(cpuMock.displayMemory[71]).toEqual(0);

      expect(cpuMock.displayMemory[128]).toEqual(1);
      expect(cpuMock.displayMemory[129]).toEqual(0);
      expect(cpuMock.displayMemory[130]).toEqual(0);
      expect(cpuMock.displayMemory[131]).toEqual(1);
      expect(cpuMock.displayMemory[132]).toEqual(0);
      expect(cpuMock.displayMemory[133]).toEqual(0);
      expect(cpuMock.displayMemory[134]).toEqual(0);
      expect(cpuMock.displayMemory[135]).toEqual(0);

      expect(cpuMock.displayMemory[192]).toEqual(1);
      expect(cpuMock.displayMemory[193]).toEqual(0);
      expect(cpuMock.displayMemory[194]).toEqual(0);
      expect(cpuMock.displayMemory[195]).toEqual(1);
      expect(cpuMock.displayMemory[196]).toEqual(0);
      expect(cpuMock.displayMemory[197]).toEqual(0);
      expect(cpuMock.displayMemory[198]).toEqual(0);
      expect(cpuMock.displayMemory[199]).toEqual(0);

      expect(cpuMock.displayMemory[256]).toEqual(1);
      expect(cpuMock.displayMemory[257]).toEqual(1);
      expect(cpuMock.displayMemory[258]).toEqual(1);
      expect(cpuMock.displayMemory[259]).toEqual(1);
      expect(cpuMock.displayMemory[260]).toEqual(0);
      expect(cpuMock.displayMemory[261]).toEqual(0);
      expect(cpuMock.displayMemory[262]).toEqual(0);
      expect(cpuMock.displayMemory[263]).toEqual(0);

      expect(cpuMock.V[0xf]).toEqual(0);
    });

    it("Dnnn - Display n-byte sprite starting at memory location I at (Vx, Vy), with a collision.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 5,
        nnn: 0x200,
        x: 0,
        y: 1,
        kk: 0,
      };

      cpuMock.V[0xf] = 1;
      cpuMock.V[0] = 0;
      cpuMock.V[1] = 0;
      cpuMock.I[0] = 0x200;

      {
        let offset = 0;
        for (let i = 0; i < cpuMock.width; i++) {
          for (let j = 0; j < cpuMock.height; j++) {
            cpuMock.displayMemory[offset++] = 0;
          }
        }
      }

      cpuMock.memory[0x200] = 0xf0;
      cpuMock.memory[0x201] = 0x90;
      cpuMock.memory[0x202] = 0x90;
      cpuMock.memory[0x203] = 0x90;
      cpuMock.memory[0x204] = 0xf0;

      cpuMock.displayMemory[0] = 1;

      instructionSet.inst_0xD(opcodeMock);

      expect(cpuMock.displayMemory[0]).toEqual(0);
      expect(cpuMock.displayMemory[1]).toEqual(1);
      expect(cpuMock.displayMemory[2]).toEqual(1);
      expect(cpuMock.displayMemory[3]).toEqual(1);
      expect(cpuMock.displayMemory[4]).toEqual(0);
      expect(cpuMock.displayMemory[5]).toEqual(0);
      expect(cpuMock.displayMemory[6]).toEqual(0);
      expect(cpuMock.displayMemory[7]).toEqual(0);

      expect(cpuMock.displayMemory[64]).toEqual(1);
      expect(cpuMock.displayMemory[65]).toEqual(0);
      expect(cpuMock.displayMemory[66]).toEqual(0);
      expect(cpuMock.displayMemory[67]).toEqual(1);
      expect(cpuMock.displayMemory[68]).toEqual(0);
      expect(cpuMock.displayMemory[69]).toEqual(0);
      expect(cpuMock.displayMemory[70]).toEqual(0);
      expect(cpuMock.displayMemory[71]).toEqual(0);

      expect(cpuMock.displayMemory[128]).toEqual(1);
      expect(cpuMock.displayMemory[129]).toEqual(0);
      expect(cpuMock.displayMemory[130]).toEqual(0);
      expect(cpuMock.displayMemory[131]).toEqual(1);
      expect(cpuMock.displayMemory[132]).toEqual(0);
      expect(cpuMock.displayMemory[133]).toEqual(0);
      expect(cpuMock.displayMemory[134]).toEqual(0);
      expect(cpuMock.displayMemory[135]).toEqual(0);

      expect(cpuMock.displayMemory[192]).toEqual(1);
      expect(cpuMock.displayMemory[193]).toEqual(0);
      expect(cpuMock.displayMemory[194]).toEqual(0);
      expect(cpuMock.displayMemory[195]).toEqual(1);
      expect(cpuMock.displayMemory[196]).toEqual(0);
      expect(cpuMock.displayMemory[197]).toEqual(0);
      expect(cpuMock.displayMemory[198]).toEqual(0);
      expect(cpuMock.displayMemory[199]).toEqual(0);

      expect(cpuMock.displayMemory[256]).toEqual(1);
      expect(cpuMock.displayMemory[257]).toEqual(1);
      expect(cpuMock.displayMemory[258]).toEqual(1);
      expect(cpuMock.displayMemory[259]).toEqual(1);
      expect(cpuMock.displayMemory[260]).toEqual(0);
      expect(cpuMock.displayMemory[261]).toEqual(0);
      expect(cpuMock.displayMemory[262]).toEqual(0);
      expect(cpuMock.displayMemory[263]).toEqual(0);

      expect(cpuMock.V[0xf]).toEqual(1);
    });
  });

  describe("0xF Instruction family", () => {
    it("Fx07 - Set Vx = delay timer value. ", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0,
        nnn: 0,
        x: 0,
        y: 0,
        kk: 0x07,
      };

      cpuMock.DT[0] = 10;

      instructionSet.inst_0xF(opcodeMock);

      expect(cpuMock.V[0]).toEqual(10);
    });

    it("Fx0A - Wait for a key press, store the value of the key in Vx.", async () => { });
    it("Fx15 - Set delay timer = Vx.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0,
        nnn: 0x200,
        x: 0,
        y: 0,
        kk: 0x15,
      };

      cpuMock.V[0] = 10;

      instructionSet.inst_0xF(opcodeMock);

      expect(cpuMock.DT[0]).toEqual(10);
    });

    it("Fx18 - Set sound timer = Vx.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0,
        nnn: 0x200,
        x: 0,
        y: 0,
        kk: 0x18,
      };

      cpuMock.V[0] = 10;

      instructionSet.inst_0xF(opcodeMock);

      expect(cpuMock.ST[0]).toEqual(10);
    });

    it("Fx1E - Set I = I + Vx.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0,
        nnn: 0x200,
        x: 0,
        y: 0,
        kk: 0x1e,
      };

      cpuMock.V[0] = 10;
      cpuMock.I[0] = 10;

      instructionSet.inst_0xF(opcodeMock);

      expect(cpuMock.I[0]).toEqual(20);
    });

    it("Fx29 - Set I = location of sprite for digit Vx.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0,
        nnn: 0x200,
        x: 0,
        y: 0,
        kk: 0x29,
      };

      instructionSet.inst_0xF(opcodeMock);

      expect(cpuMock.I[0]).toEqual(0x10);
    });

    it("Fx33 - Store BCD representation of Vx in memory locations I, I+1, and I+2.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0,
        nnn: 0x200,
        x: 0,
        y: 0,
        kk: 0x33,
      };

      cpuMock.I[0] = 0x200;
      cpuMock.V[0] = 56124;

      instructionSet.inst_0xF(opcodeMock);

      expect(cpuMock.memory[0x200]).toEqual(1);
      expect(cpuMock.memory[0x201]).toEqual(2);
      expect(cpuMock.memory[0x202]).toEqual(4);
    });

    it("Fx55 - Store BCD representation of Vx in memory locations I, I+1, and I+2.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0,
        nnn: 0x200,
        x: 0,
        y: 0,
        kk: 0x55,
      };

      cpuMock.V[0x0] = 1;
      cpuMock.V[0x1] = 2;
      cpuMock.V[0x2] = 3;
      cpuMock.V[0x3] = 4;
      cpuMock.V[0x4] = 4;
      cpuMock.V[0x5] = 6;
      cpuMock.V[0x6] = 6;
      cpuMock.V[0x7] = 7;
      cpuMock.V[0x8] = 8;
      cpuMock.V[0x9] = 9;
      cpuMock.V[0xa] = 0xa;
      cpuMock.V[0xb] = 0xb;
      cpuMock.V[0xc] = 0xc;
      cpuMock.V[0xd] = 0xd;
      cpuMock.V[0xe] = 0xe;
      cpuMock.V[0xf] = 0xf;
      cpuMock.I[0x0] = 0;

      instructionSet.inst_0xF(opcodeMock);

      expect(cpuMock.memory[0x0]).toEqual(1);
      expect(cpuMock.memory[0x1]).toEqual(2);
      expect(cpuMock.memory[0x2]).toEqual(3);
      expect(cpuMock.memory[0x3]).toEqual(4);
      expect(cpuMock.memory[0x4]).toEqual(4);
      expect(cpuMock.memory[0x5]).toEqual(6);
      expect(cpuMock.memory[0x6]).toEqual(6);
      expect(cpuMock.memory[0x7]).toEqual(7);
      expect(cpuMock.memory[0x8]).toEqual(8);
      expect(cpuMock.memory[0x9]).toEqual(9);
      expect(cpuMock.memory[0xa]).toEqual(0xa);
      expect(cpuMock.memory[0xb]).toEqual(0xb);
      expect(cpuMock.memory[0xc]).toEqual(0xc);
      expect(cpuMock.memory[0xd]).toEqual(0xd);
      expect(cpuMock.memory[0xe]).toEqual(0xe);
      expect(cpuMock.memory[0xf]).toEqual(0xf);
    });

    it("Fx65 - Store BCD representation of Vx in memory locations I, I+1, and I+2.", async () => {
      const opcodeMock: Opcode = {
        address: 0,
        n: 0,
        nnn: 0x200,
        x: 0,
        y: 0,
        kk: 0x65,
      };

      cpuMock.memory[0x0] = 1;
      cpuMock.memory[0x1] = 2;
      cpuMock.memory[0x2] = 3;
      cpuMock.memory[0x3] = 4;
      cpuMock.memory[0x4] = 4;
      cpuMock.memory[0x5] = 6;
      cpuMock.memory[0x6] = 6;
      cpuMock.memory[0x7] = 7;
      cpuMock.memory[0x8] = 8;
      cpuMock.memory[0x9] = 9;
      cpuMock.memory[0xa] = 0xa;
      cpuMock.memory[0xb] = 0xb;
      cpuMock.memory[0xc] = 0xc;
      cpuMock.memory[0xd] = 0xd;
      cpuMock.memory[0xe] = 0xe;
      cpuMock.memory[0xf] = 0xf;
      cpuMock.I[0x0] = 0;

      instructionSet.inst_0xF(opcodeMock);

      expect(cpuMock.V[0x0]).toEqual(1);
      expect(cpuMock.V[0x1]).toEqual(2);
      expect(cpuMock.V[0x2]).toEqual(3);
      expect(cpuMock.V[0x3]).toEqual(4);
      expect(cpuMock.V[0x4]).toEqual(4);
      expect(cpuMock.V[0x5]).toEqual(6);
      expect(cpuMock.V[0x6]).toEqual(6);
      expect(cpuMock.V[0x7]).toEqual(7);
      expect(cpuMock.V[0x8]).toEqual(8);
      expect(cpuMock.V[0x9]).toEqual(9);
      expect(cpuMock.V[0xa]).toEqual(0xa);
      expect(cpuMock.V[0xb]).toEqual(0xb);
      expect(cpuMock.V[0xc]).toEqual(0xc);
      expect(cpuMock.V[0xd]).toEqual(0xd);
      expect(cpuMock.V[0xe]).toEqual(0xe);
      expect(cpuMock.V[0xf]).toEqual(0xf);
    });
  });
});
