import { SpritePositionTable } from "../shared";

interface SpriteHandlerPort {
  spritePositions: SpritePositionTable;
  buffer: Uint8Array;
}

export default SpriteHandlerPort;
