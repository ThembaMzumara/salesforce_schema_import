import { program } from 'commander';
import { spawnSync } from 'child_process'; // Use spawnSync for synchronous execution
import { generateSOQL } from './commands/generateSOQL';
import { generateCLICommands } from './commands/generateCLICommands';

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
      const outputDir = './csv_files/'; // Specify or generate dynamically

      // Use spawnSync to run the Python script
      const pythonProcess = spawnSync('python3', ['python_src/process_csv.py', csvFile, outputDir], {
        encoding: 'utf-8', // Ensure the output is returned as a string
      });

      // Check if the process ran successfully
      if (pythonProcess.error) {
        throw pythonProcess.error;
      }

      // Output the results (stdout)
      console.log('Python script executed successfully:');
      console.log(pythonProcess.stdout); // Log the output of the Python script

      // If there were errors, they will be in stderr
      if (pythonProcess.stderr) {
        console.error('Python script error output:');
        console.error(pythonProcess.stderr); // Log any error output
      }
    } catch (error) {
      console.error('Error importing metadata using Python script:', error);
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
      console.error('Error generating SOQL:', error);
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
      console.error('Error generating CLI commands:', error);
    }
  });

program.parse(process.argv);
