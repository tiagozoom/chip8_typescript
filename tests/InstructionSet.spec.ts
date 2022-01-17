import InstructionSet from "../src/InstructionSet"
import { CPUPort, InputPort, InstructionSetPort, OutputPort } from "../src/ports";
import { Opcode } from "../src/shared";

class InputMock implements InputPort {
  read() {
    return ''
  }
}

class Outputmock implements OutputPort {
  write(data: Buffer) { };
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
  execute(opcode: Opcode) { };
  clearDisplay() { };

  constructor() {
    this.input = new InputMock();
    this.output = new Outputmock();
    this.height = 64;
    this.width = 32;
    this.displayMemory = Buffer.alloc(this.width * this.height, 255);
    this.memory = Buffer.alloc(0, 255);
    this.PC[0] = 0;
    this.instructions = new InstructionSet(this)
    this.execute = jest.fn()
    this.clearDisplay = jest.fn()
  }
}

describe('#InstructionSet test suite', () => {

  let instructionSet: InstructionSetPort;
  let cpuMock: CPUPort;

  beforeEach(() => {
    cpuMock = new CPUMock()
    instructionSet = new InstructionSet(cpuMock);
  })

  describe('0x0 Instruction family', () => {
    it('00E0 - Clear the display.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 0, nnn: 0x200, x: 0, y: 0, kk: 0xE0 };

      instructionSet.inst_0x0(opcodeMock)

      expect(cpuMock.clearDisplay).toHaveBeenCalledTimes(1)
    })

    it('00EE - Return from a subroutine.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 0, nnn: 0x200, x: 0, y: 0, kk: 0xEE };

      cpuMock.stack[0] = 0x1
      cpuMock.stack[1] = 0x100
      cpuMock.SP[0] = 1

      instructionSet.inst_0x0(opcodeMock)

      expect(cpuMock.PC[0]).toEqual(0x100)
      expect(cpuMock.SP[0]).toEqual(0)
    })
  })

  describe('0x1 Instruction family', () => {
    it('1nnn - Jump to location nnn.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 0, nnn: 0x200, x: 0, y: 0, kk: 0 };

      instructionSet.inst_0x1(opcodeMock)

      expect(cpuMock.PC[0]).toEqual(0x200)
    })
  })

  describe('0x2 Instruction family', () => {
    it('2nnn - Call subroutine at nnn.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 0, nnn: 0x200, x: 0, y: 0, kk: 0 };

      cpuMock.PC[0] = 0x10;

      instructionSet.inst_0x2(opcodeMock)

      expect(cpuMock.SP[0]).toEqual(1)
      expect(cpuMock.stack[0]).toEqual(0x10)
      expect(cpuMock.PC[0]).toEqual(0x200)
    })
  })

  describe('0x3 Instruction family', () => {
    it('3xkk - Skip next instruction Vx === kk.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 0, nnn: 0x200, x: 1, y: 0, kk: 0x10 };

      cpuMock.PC[0] = 1;
      cpuMock.V[1] = 0x10;

      instructionSet.inst_0x3(opcodeMock)

      expect(cpuMock.PC[0]).toEqual(3)
    })

    it('3xkk - Don\'t Skip next instruction Vx !== kk.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 0, nnn: 0x200, x: 1, y: 0, kk: 0x20 };

      cpuMock.PC[0] = 1;
      cpuMock.V[1] = 0x10;

      instructionSet.inst_0x3(opcodeMock)

      expect(cpuMock.PC[0]).toEqual(1)
    })
  })

  describe('0x4 Instruction family', () => {
    it('4xkk - Skip next instruction Vx !== kk.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 0, nnn: 0x200, x: 1, y: 0, kk: 0x20 };

      cpuMock.PC[0] = 1;
      cpuMock.V[1] = 0x10;

      instructionSet.inst_0x4(opcodeMock)

      expect(cpuMock.PC[0]).toEqual(3)
    })

    it('4xkk - Don\'t Skip next instruction Vx === kk.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 0, nnn: 0x200, x: 1, y: 0, kk: 0x10 };

      cpuMock.PC[0] = 1;
      cpuMock.V[1] = 0x10;

      instructionSet.inst_0x4(opcodeMock)

      expect(cpuMock.PC[0]).toEqual(1)
    })
  })

  describe('0x5 Instruction family', () => {
    it('5xkk - Skip next instruction Vx === Vy.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 0, nnn: 0x200, x: 0, y: 1, kk: 0x20 };

      cpuMock.PC[0] = 1;
      cpuMock.V[0] = 0x10;
      cpuMock.V[1] = 0x10;

      instructionSet.inst_0x5(opcodeMock)

      expect(cpuMock.PC[0]).toEqual(3)
    })

    it('5xkk - Don\'t Skip next instruction Vx !== kk.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 0, nnn: 0x200, x: 0, y: 1, kk: 0x10 };

      cpuMock.PC[0] = 1;
      cpuMock.V[0] = 0x10;
      cpuMock.V[1] = 0x20;

      instructionSet.inst_0x5(opcodeMock)

      expect(cpuMock.PC[0]).toEqual(1)
    })
  })

  describe('0x6 Instruction family', () => {
    it('6xkk - Set Vx = kk.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 0, nnn: 0x200, x: 0, y: 1, kk: 0x20 };

      instructionSet.inst_0x6(opcodeMock)

      expect(cpuMock.V[0]).toEqual(0x20)
    })
  })

  describe('0x7 Instruction family', () => {
    it('7xkk - Set Vx = Vx + kk.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 0, nnn: 0x200, x: 0, y: 1, kk: 20 };
      cpuMock.V[0] = 10

      instructionSet.inst_0x7(opcodeMock)

      expect(cpuMock.V[0]).toEqual(30)
    })
  })

  describe('0x8 Instruction family', () => {
    it('8xy0 - Set Vx = Vy.  ', async () => {
      const opcodeMock: Opcode = { address: 0, n: 0, nnn: 0x200, x: 0, y: 1, kk: 20 };
      cpuMock.V[0] = 10
      cpuMock.V[1] = 20

      instructionSet.inst_0x8(opcodeMock)

      expect(cpuMock.V[0]).toEqual(20)
    })

    it('8xy1 - Set Vx = Vx OR Vy.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 1, nnn: 0x200, x: 0, y: 1, kk: 0 };
      cpuMock.V[0] = 10
      cpuMock.V[1] = 5

      instructionSet.inst_0x8(opcodeMock)

      expect(cpuMock.V[0]).toEqual(0xF)
    })

    it('8xy2 - Set Vx = Vx AND Vy.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 2, nnn: 0x200, x: 0, y: 1, kk: 0 };
      cpuMock.V[0] = 10
      cpuMock.V[1] = 3

      instructionSet.inst_0x8(opcodeMock)

      expect(cpuMock.V[0]).toEqual(2)
    })

    it('8xy3 - Set Vx = Vx XOR Vy.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 3, nnn: 0x200, x: 0, y: 1, kk: 0 };
      cpuMock.V[0] = 10
      cpuMock.V[1] = 3

      instructionSet.inst_0x8(opcodeMock)

      expect(cpuMock.V[0]).toEqual(9)
    })

    it('8xy4 - Set Vx = Vx + Vy, set VF = carry.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 4, nnn: 0x200, x: 0, y: 1, kk: 0 };
      cpuMock.V[0] = 0xFF
      cpuMock.V[1] = 0xFF

      instructionSet.inst_0x8(opcodeMock)

      expect(cpuMock.V[0]).toEqual(0xFE)
      expect(cpuMock.V[0xF]).toEqual(1)
    })

    it('8xy5 - Set Vx = Vx - Vy, set VF = NOT borrow.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 5, nnn: 0x200, x: 0, y: 1, kk: 0 };
      cpuMock.V[0] = 0x1
      cpuMock.V[1] = 0xFF

      instructionSet.inst_0x8(opcodeMock)

      expect(cpuMock.V[0]).toEqual(0xFF02)
      expect(cpuMock.V[0xF]).toEqual(0)
    })

    it('8xy5 - Set Vx = Vx - Vy, set VF = 1 borrow.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 5, nnn: 0x200, x: 0, y: 1, kk: 0 };
      cpuMock.V[0] = 0xFF
      cpuMock.V[1] = 0x1

      instructionSet.inst_0x8(opcodeMock)

      expect(cpuMock.V[0]).toEqual(0xFE)
      expect(cpuMock.V[0xF]).toEqual(1)
    })

    it('8xy6 - Set Vx = Vx SHR 1.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 6, nnn: 0x200, x: 0, y: 1, kk: 0 };
      cpuMock.V[0] = 10

      instructionSet.inst_0x8(opcodeMock)

      expect(cpuMock.V[0]).toEqual(5)
      expect(cpuMock.V[0xF]).toEqual(0)
    })

    it('8xy6 - Set Vx = Vx SHR 1 VF = 1', async () => {
      const opcodeMock: Opcode = { address: 0, n: 6, nnn: 0x200, x: 0, y: 1, kk: 0 };
      cpuMock.V[0] = 15

      instructionSet.inst_0x8(opcodeMock)

      expect(cpuMock.V[0]).toEqual(7)
      expect(cpuMock.V[0xF]).toEqual(1)
    })

    it('8xy7 - Set Vx = Vy - Vx, set VF = NOT borrow.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 7, nnn: 0x200, x: 0, y: 1, kk: 0 };
      cpuMock.V[0] = 0xFF
      cpuMock.V[1] = 0x1

      instructionSet.inst_0x8(opcodeMock)

      expect(cpuMock.V[0]).toEqual(0xFF02)
      expect(cpuMock.V[0xF]).toEqual(0)
    })

    it('8xy7 - Set Vx = Vy - Vx, set VF = borrow.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 7, nnn: 0x200, x: 0, y: 1, kk: 0 };
      cpuMock.V[0] = 0x1
      cpuMock.V[1] = 0xFF

      instructionSet.inst_0x8(opcodeMock)

      expect(cpuMock.V[0]).toEqual(0xFE)
      expect(cpuMock.V[0xF]).toEqual(1)
    })

    it('8xyE - Set Vx = Vx SHL 1.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 0xE, nnn: 0x200, x: 0, y: 1, kk: 0 };
      cpuMock.V[0] = 5

      instructionSet.inst_0x8(opcodeMock)

      expect(cpuMock.V[0]).toEqual(10)
      expect(cpuMock.V[0xF]).toEqual(0)
    })

    it('8xyE - Set Vx = Vx SHL 1 set VF = 1', async () => {
      const opcodeMock: Opcode = { address: 0, n: 0xE, nnn: 0x200, x: 0, y: 1, kk: 0 };
      cpuMock.V[0] = 0xF000

      instructionSet.inst_0x8(opcodeMock)

      expect(cpuMock.V[0]).toEqual(0xE000)
      expect(cpuMock.V[0xF]).toEqual(1)
    })
  })


  describe('0x9 Instruction family', () => {
    it('9xy0 - Skip next instruction if Vx != Vy.', async () => {
    })
  })
})
