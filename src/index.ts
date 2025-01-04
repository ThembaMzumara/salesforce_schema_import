import { program } from 'commander';
import { spawnSync } from 'child_process'; // Use spawnSync for subprocess execution
import { generateSOQL } from './commands/generateSOQL';
import { generateCLICommands } from './commands/generateCLICommands';
import * as path from 'path';

// Function to run a Python script within a virtual environment
function runPythonScriptWithVenv(scriptPath: string, inputCsv: string) {
  try {
    // Hardcode the output directory
    const outputDir = 'csv_files/output_data'; 

    // Escape the input CSV argument for safe shell execution
    const sanitizedInputCsv = `"${inputCsv.replace(/(["$`\\])/g, '\\$1')}"`;

    // Define the venv activation and script execution command with hardcoded output directory
    const venvActivateCommand = `bash -c "source ${path.resolve('./python_src/venv/bin/activate')} && python3 ${scriptPath} ${sanitizedInputCsv} ${outputDir}"`;

    // Execute the command using spawnSync
    const result = spawnSync(venvActivateCommand, {
      shell: true,
      stdio: 'inherit', // Forward output to terminal
    });

    // Check for subprocess errors
    if (result.error) {
      throw new Error(`Failed to execute Python script: ${result.error.message}`);
    }

    if (result.status !== 0) {
      throw new Error(`Python script exited with code ${result.status}`);
    }

    console.log('✅ Python script executed successfully.');
  } catch (error) {
    console.error('❌ Error running Python script with venv:', error);
  }
}

program
  .name('ssm')
  .description('CLI tool to migrate Salesforce schema metadata and data')
  .version('1.0.0');

// Command to import metadata from CSV to JSON
program
  .command('import-metadata')
  .description('Import metadata from a CSV file')
  .argument('<csvFile>', 'CSV file with Salesforce metadata')
  .action((csvFile: string) => {
    try {
      const scriptPath = path.resolve('./python_src/process_csv.py');
      runPythonScriptWithVenv(scriptPath, csvFile);
    } catch (error) {
      console.error('❌ Error importing metadata:', error);
    }
  });

// Command to generate SOQL queries from JSON
program
  .command('generate-soql')
  .description('Generate SOQL queries from metadata JSON')
  .argument('<jsonFile>', 'JSON file with parsed metadata')
  .action(async (jsonFile: string) => {
    try {
      await generateSOQL(jsonFile);
    } catch (error) {
      console.error('❌ Error generating SOQL:', error);
    }
  });

// Command to generate Salesforce CLI commands for creating objects/fields
program
  .command('generate-cli')
  .description('Generate Salesforce CLI commands from metadata JSON')
  .argument('<jsonFile>', 'JSON file with parsed metadata')
  .action(async (jsonFile: string) => {
    try {
      await generateCLICommands(jsonFile);
    } catch (error) {
      console.error('❌ Error generating CLI commands:', error);
    }
  });

program.parse(process.argv);
