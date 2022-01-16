import { readFileSync } from "fs";
import sdl from "@kmamal/sdl";
import { setTimeout } from "timers/promises";
import CPU from "./src/CPU";
import Input from "./src/Input";
import Output from "./src/Output";
import { CPUPort } from "./src/ports";

const WIDTH = 0x40;
const HEIGHT = 0x20;

class Chip8 {
  cpu: CPUPort;

  constructor(cartridge: string) {
    //this.memory = readFileSync(cartridge);
    const input = new Input()
    const output = new Output()
    this.cpu = new CPU(WIDTH, HEIGHT, input, output);
  }

  /*private convertToOpcode(bytes: number): Opcode {
    const opcode: Opcode = {
      address: bytes >> 12,
      nnn: bytes & 0x0fff,
      n: bytes & 0x000f,
      x: (bytes >> 8) & 0x0f,
      y: (bytes >> 4) & 0x00f,
      kk: bytes & 0x00ff,
    };
    return opcode;
  }*/

  async mainLoop() {
    /*const window = sdl.video.createWindow({
      title: "HELLO",
      width: WIDTH * 10,
      height: HEIGHT * 10,
      borderless: true,
    });

    const { width, height } = window;

    while (!window.destroyed) {
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
