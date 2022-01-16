import { OutputPort } from "./ports";

class Output implements OutputPort {
    write(data: Buffer) { };
}

export default Output