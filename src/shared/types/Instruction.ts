import Opcode from "./Opcode";

type Instruction = (opcode: Opcode) => void;

export default Instruction