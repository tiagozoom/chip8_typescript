import { setTimeout } from "timers/promises";
import CPU from "./CPU";
import Input from "./Input";
import Output from "./Output";
import SpritesHandler from "./SpritesHandler";
import { CPUPort, InputPort, OutputPort } from "./ports";

const WIDTH = 0x40;
const HEIGHT = 0x20;

class Chip8 {
  cpu: CPUPort;
  output: OutputPort;
  input: InputPort;

  constructor(cartridge: string) {
    //this.memory = readFileSync(cartridge);
    this.input = new Input();
    this.output = new Output();
    const sprintesHandler = new SpritesHandler();
    this.cpu = new CPU(WIDTH, HEIGHT, this.input, this.output, sprintesHandler);
  }

  async mainLoop() {
    this.cpu.clearDisplay();
    /*while (!window.destroyed) {
      const word = (this.memory[this.PC[0]] << 8) + this.memory[this.PC[0] + 1];
      const opcode: Opcode = this.convertToOpcode(word);
      //this.execute(opcode);
      //window.render(WIDTH, HEIGHT, WIDTH * 4, "argb8888", this.display);
      this.render();
      await setTimeout(0);
    }*/
  }
}

const chip8 = new Chip8("./test.ch8");

chip8.mainLoop();
