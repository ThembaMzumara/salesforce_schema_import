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
  .version('1.0.0')
  .usage('[options] [command]');

// Command to import metadata from CSV to JSON
program
  .command('import-metadata')
  .description('Import metadata from a CSV file and process it into a structured format')
  .argument('<csvFile>', 'Path to the CSV file containing Salesforce metadata')
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
  .description('Generate Salesforce Object Query Language (SOQL) queries based on provided metadata JSON')
  .argument('<jsonFile>', 'Path to the JSON file containing parsed metadata')
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
  .description('Generate Salesforce CLI commands based on metadata JSON for schema migration')
  .argument('<jsonFile>', 'Path to the JSON file containing parsed metadata')
  .action(async (jsonFile: string) => {
    try {
      await generateCLICommands(jsonFile);
    } catch (error) {
      console.error('❌ Error generating CLI commands:', error);
    }
  });

program.on('option:help', () => {
  console.log(`
CLI Tool for Salesforce Schema Migration and Management

Usage:
    ssm [options] [command]

Options:
    -V, --version              Show the version number
    -h, --help                 Display help information for the tool or command

Commands:
    import-metadata <csvFile>  Import metadata from a CSV file and process it into a structured format
    generate-soql <jsonFile>   Generate SOQL queries based on provided metadata JSON
    generate-cli <jsonFile>    Generate Salesforce CLI commands for schema migration from metadata JSON

For detailed help on any specific command, use:
    ssm <command> --help
  `);
});

program.parse(process.argv);
