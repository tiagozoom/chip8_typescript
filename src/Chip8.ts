import { setTimeout } from "timers/promises";
import CPU from "./CPU";
import Input from "./Input";
import Output from "./Output";
import SpritesHandler from "./SpritesHandler";
import { CPUPort, InputPort, MediaLayerPort, OutputPort } from "./ports";
import MediaLayer from "./MediaLayer";
import { Resolution } from "./shared";

const WIDTH = 0x40;
const HEIGHT = 0x20;

class Chip8 {
  cpu: CPUPort;
  output: OutputPort;
  input: InputPort;

  constructor(cartridge: string) {
    const originalResolution = { width: WIDTH, height: HEIGHT, stride: 1 } as Resolution;
    const resolution = { width: WIDTH * 10, height: HEIGHT * 10, stride: 4 } as Resolution;

    const mediaLayer: MediaLayerPort = new MediaLayer(resolution);
    this.input = new Input();
    this.output = new Output(mediaLayer, resolution, originalResolution);
    const sprintesHandler = new SpritesHandler();
    this.cpu = new CPU(WIDTH, HEIGHT, this.input, this.output, sprintesHandler);
    this.cpu.readCartridge(cartridge);
  }

  async mainLoop() {
    this.cpu.clearDisplay();
    this.output.createWindow("teste", true);
    while (this.output.windowExists()) {
      const instruction = this.cpu.readNextInstruction();
      const opcode = this.cpu.convertToOpcode(instruction);
      this.cpu.execute(opcode);
      this.output.write(this.cpu.displayMemory);
      await setTimeout(0);
    }
  }
}

const chip8 = new Chip8("./test_opcode.ch8");

chip8.mainLoop();
