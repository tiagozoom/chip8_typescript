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
    it('0x00E0 - Clear the display.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 0, nnn: 0x200, x: 0, y: 0, kk: 0xE0 };

      instructionSet.inst_0x0(opcodeMock)

      expect(cpuMock.clearDisplay).toHaveBeenCalledTimes(1)
    })

    it('0x00EE - Return from a subroutine.', async () => {
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
    it('0x1nnn - Jump to location nnn.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 0, nnn: 0x200, x: 0, y: 0, kk: 0 };

      instructionSet.inst_0x1(opcodeMock)

      expect(cpuMock.PC[0]).toEqual(0x200)
    })
  })

  describe('0x2 Instruction family', () => {
    it('0x2nnn - Call subroutine at nnn.', async () => {
      const opcodeMock: Opcode = { address: 0, n: 0, nnn: 0x200, x: 0, y: 0, kk: 0 };

      cpuMock.PC[0] = 0x10;

      instructionSet.inst_0x2(opcodeMock)

      expect(cpuMock.SP[0]).toEqual(1)
      expect(cpuMock.stack[0]).toEqual(0x10)
      expect(cpuMock.PC[0]).toEqual(0x200)
    })
  })
})
