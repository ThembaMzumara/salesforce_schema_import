import * as fs from 'fs';
import { generateCLI } from '../utils/salesforceCliHandler';

export const generateCLICommands = (jsonFile: string) => {
  try {
    // Read the file
    const data = fs.readFileSync(jsonFile, 'utf-8');

    // Ensure the file is valid JSON
    let metadata;
    try {
      metadata = JSON.parse(data);
    } catch (parseError) {
      console.error('Error: The file is not valid JSON. Please check its structure.');
      return;
    }

    // Generate CLI commands
    const cliCommands = generateCLI(metadata);

    // Print each command to the console
    cliCommands.forEach((command) => console.log(command));
  } catch (error) {
    console.error('Error generating CLI commands:', error);
  }
};
