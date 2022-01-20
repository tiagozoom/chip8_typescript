import { Window } from "../shared";

interface OutputPort {
  write: (data: Buffer) => void;
}

export default OutputPort;
