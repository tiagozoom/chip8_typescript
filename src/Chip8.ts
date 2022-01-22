import { setTimeout } from "timers/promises";
import CPU from "./CPU";
import Input from "./Input";
import Output from "./Output";
import SpritesHandler from "./SpritesHandler";
import { CPUPort, InputPort, MediaLayerPort, OutputPort } from "./ports";
import MediaLayer from "./MediaLayer";

const WIDTH = 0x40;
const HEIGHT = 0x20;

class Chip8 {
  cpu: CPUPort;
  output: OutputPort;
  input: InputPort;

  constructor(cartridge: string) {
    const width = 64 * 10;
    const height = 32 * 10;
    const stride = width * 4;
    const mediaLayer: MediaLayerPort = new MediaLayer(width, height, stride);
    this.input = new Input();
    this.output = new Output(mediaLayer, width * height * stride);
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

const chip8 = new Chip8("./test.ch8");

chip8.mainLoop();
