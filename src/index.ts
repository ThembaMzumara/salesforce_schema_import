import { program } from 'commander';
import { spawnSync } from 'child_process'; // Use spawnSync for subprocess execution
import { generateSOQL } from './commands/generateSOQL';
import { generateCLICommands } from './commands/generateCLICommands';
import * as path from 'path';

// Function to run a Python script within a virtual environment
function runPythonScriptWithVenv(scriptPath: string, args: string[]) {
  try {
    // Escape each argument for safe shell execution
    const sanitizedArgs = args.map(arg => `"${arg.replace(/(["$`\\])/g, '\\$1')}"`).join(' ');

    // Use bash to activate the venv and run the script
    const venvActivateCommand = `bash -c "source ${path.resolve('./python_src/venv/bin/activate')} && python3 ${scriptPath} ${sanitizedArgs}"`;

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
      const outputDir = './csv_files/'; // Output directory for processed files
      const scriptPath = path.resolve('./python_src/process_csv.py');
      runPythonScriptWithVenv(scriptPath, [csvFile, outputDir]);
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
