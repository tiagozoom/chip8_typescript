import InstructionSet from "./InstructionSet";
import { CPUPort, InputPort, InstructionSetPort, OutputPort } from "./ports";
import { Opcode } from "./shared";
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

    constructor(width: number, height: number, input: InputPort, output: OutputPort) {
        this.input = input;
        this.output = output;
        this.height = height;
        this.width = width;
        this.displayMemory = Buffer.alloc(width * height, 255);
        this.PC[0] = 0;
        this.instructions = new InstructionSet(this)
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
            0xA: this.instructions.inst_0xA,
            0xB: this.instructions.inst_0xB,
            0xC: this.instructions.inst_0xC,
            0xD: this.instructions.inst_0xD,
            0xE: this.instructions.inst_0xE,
            0xF: this.instructions.inst_0xF,
        }
    }

    clearDisplay() { };
    execute(opcode: Opcode) {
        this.instructionTable[opcode.address](opcode);
        this.PC[0] += 2;
    };

}

export default CPU