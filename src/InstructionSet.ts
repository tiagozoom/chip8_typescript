import { CPUPort, InstructionSetPort } from "./ports";
import { Opcode } from "./shared";

class InstructionSet implements InstructionSetPort {
  cpu: CPUPort;

  constructor(cpu: CPUPort) {
    this.cpu = cpu;
  }

  inst_0x0(opcode: Opcode) {
    if (opcode.kk === 0xe0) {
      this.cpu.clearDisplay();
    } else if (opcode.kk === 0xee) {
      this.cpu.PC[0] = this.cpu.stack[this.cpu.SP[0]];
      this.cpu.SP[0]--;
    }
  }

  inst_0x1(opcode: Opcode) {
    this.cpu.PC[0] = opcode.nnn;
  }

  inst_0x2(opcode: Opcode) {
    this.cpu.stack[this.cpu.SP[0]++] = this.cpu.PC[0];
    this.cpu.PC[0] = opcode.nnn;
  }

  inst_0x3(opcode: Opcode) {
    if (this.cpu.V[opcode.x] === opcode.kk) this.cpu.PC[0] += 2;
  }

  inst_0x4(opcode: Opcode) {
    if (this.cpu.V[opcode.x] !== opcode.kk) this.cpu.PC[0] += 2;
  }

  inst_0x5(opcode: Opcode) {
    if (this.cpu.V[opcode.x] === this.cpu.V[opcode.y]) this.cpu.PC[0] += 2;
  }

  inst_0x6(opcode: Opcode) {
    this.cpu.V[opcode.x] = opcode.kk;
  }

  inst_0x7(opcode: Opcode) {
    this.cpu.V[opcode.x] += opcode.kk;
  }

  inst_0x8(opcode: Opcode) {
    if (opcode.n === 0) this.cpu.V[opcode.x] = this.cpu.V[opcode.y];
    else if (opcode.n === 1) this.cpu.V[opcode.x] |= this.cpu.V[opcode.y];
    else if (opcode.n === 2) this.cpu.V[opcode.x] &= this.cpu.V[opcode.y];
    else if (opcode.n === 3) this.cpu.V[opcode.x] ^= this.cpu.V[opcode.y];
    else if (opcode.n === 4) {
      const sum = this.cpu.V[opcode.x] + this.cpu.V[opcode.y];
      this.cpu.V[0xf] = sum > 255 ? 1 : 0;
      this.cpu.V[opcode.x] = sum & 0x00ff;
    } else if (opcode.n === 5) {
      this.cpu.V[0xf] = this.cpu.V[opcode.x] > this.cpu.V[opcode.y] ? 1 : 0;
      this.cpu.V[opcode.x] -= this.cpu.V[opcode.y];
    } else if (opcode.n === 6) {
      this.cpu.V[0xf] = this.cpu.V[opcode.x] & 0x0001 ? 1 : 0;
      this.cpu.V[opcode.x] /= 2;
    } else if (opcode.n === 7) {
      this.cpu.V[0xf] = this.cpu.V[opcode.y] > this.cpu.V[opcode.x] ? 1 : 0;
      this.cpu.V[opcode.x] = this.cpu.V[opcode.y] - this.cpu.V[opcode.x];
    } else if (opcode.n === 0xe) {
      this.cpu.V[0xf] = this.cpu.V[opcode.x] >> 15 ? 1 : 0;
      this.cpu.V[opcode.x] *= 2;
    }
  }

  inst_0x9(opcode: Opcode) {
    if (this.cpu.V[opcode.x] !== this.cpu.V[opcode.y]) this.cpu.PC[0] += 2;
  }

  inst_0xA(opcode: Opcode) {
    this.cpu.I[0] = opcode.nnn;
  }

  inst_0xB(opcode: Opcode) {
    this.cpu.PC[0] = opcode.nnn + this.cpu.V[0x0];
  }

  inst_0xC(opcode: Opcode) {
    const rand = Math.floor(Math.random() * 255);
    this.cpu.V[opcode.x] = opcode.kk & rand;
  }

  inst_0xD(opcode: Opcode) {
    let pixelWasErased: boolean = false;
    for (let i = 0; i < opcode.n; i++) {
      const byte = this.cpu.memory[this.cpu.I[0] + i];
      const y = (this.cpu.V[opcode.y] + i) % this.cpu.height;
      for (let j = 7; j >= 0; j--) {
        const x = (this.cpu.V[opcode.x] + (7 - j)) % this.cpu.width;
        const bit = (byte >> j) & 0x1;
        let offset = y * this.cpu.height + x;
        pixelWasErased ||= !!(bit && bit === this.cpu.displayMemory[offset]);
        this.cpu.displayMemory[offset] = bit ^ this.cpu.displayMemory[offset];
      }
      this.cpu.V[0xf] = pixelWasErased ? 1 : 0;
    }
  }

  inst_0xE(opcode: Opcode) {}

  inst_0xF(opcode: Opcode) {
    if (opcode.kk === 0x07) this.cpu.V[opcode.x] = this.cpu.DT[0];
    else if (opcode.kk === 0x15) this.cpu.DT[0] = this.cpu.V[opcode.x];
    else if (opcode.kk === 0x18) this.cpu.ST[0] = this.cpu.V[opcode.x];
    else if (opcode.kk === 0x1e) this.cpu.I[0] += this.cpu.V[opcode.x];
    else if (opcode.kk === 0x29) {
      this.cpu.I[0] = this.cpu.spritesHandler.spritePositions[opcode.x];
    } else if (opcode.kk === 0x33) {
      const number = this.cpu.V[opcode.x];
      const numbers = number.toString().split("");
      const stack = [...numbers];
      for (let i = 2; i >= 0; i--) {
        this.cpu.memory[this.cpu.I[0] + i] = Number(stack.pop() || 0);
      }
    } else if (opcode.kk === 0x55) {
      for (let i = 0; i < opcode.x; i++) {
        this.cpu.memory[this.cpu.I[0] + i] = this.cpu.V[i];
      }
    } else if (opcode.kk === 0x65) {
      for (let i = 0; i < opcode.x; i++) {
        this.cpu.V[i] = this.cpu.memory[this.cpu.I[0] + i];
      }
    }
  }
}

export default InstructionSet;
