export const parseInstructions = (string) => {
    let instructionsBody = string.split(" ");
    let instructions = [];
    let instruction = [];
    let count = 0;
    for (let i = 0; i < instructionsBody.length + count; i++) {
      if (instructionsBody[i]?.includes("\n")) {
        let toAdd = instructionsBody[i].split("\n");

        instruction.push(toAdd[0]);

        if (instruction.length > 2) instructions.push(instruction);

        instruction = [];

        if (toAdd.length === 3) instruction.push(toAdd[2]);
        else if (toAdd.length === 4) instruction.push(toAdd[3]);
        else instruction.push(toAdd[1]);

        count++;
        continue;
      }
      if (instructionsBody[i] !== undefined) instruction.push(instructionsBody[i]);

      if (instructionsBody.length === i) instructions.push(instruction);
  }
  console.log(instructionsBody)
  return instructionsBody
}

