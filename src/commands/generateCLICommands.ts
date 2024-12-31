import * as fs from 'fs';
import { generateCLI } from '../utils/salesforceCliHandler';

export const generateCLICommands = (jsonFile: string) => {
  try {
    const data = fs.readFileSync(jsonFile, 'utf-8');
    const metadata = JSON.parse(data);
    const cliCommands = generateCLI(metadata);
    cliCommands.forEach((command) => console.log(command));
  } catch (error) {
    console.error('Error generating CLI commands:', error);
  }
};
