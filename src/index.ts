import { program } from 'commander';
import { importMetadata } from './commands/importMetadata';
import { generateSOQL } from './commands/generateSOQL';
import { generateCLICommands } from './commands/generateCLICommands';

program
  .name('salesforce-schema-migration')
  .description('CLI tool to migrate Salesforce schema metadata and data')
  .version('1.0.0');

// Command to import metadata from CSV to JSON
program
  .command('import-metadata')
  .description('Import metadata from a CSV file')
  .argument('<csvFile>', 'CSV file with Salesforce metadata')
  .action(async (csvFile: string) => {
    try {
      await importMetadata(csvFile);
    } catch (error) {
      console.error('Error importing metadata:', error);
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

// Command to import data from a CSV to Salesforce org
program
  .command('import-data')
  .description('Import data from a CSV to Salesforce org')
  .argument('<csvFile>', 'CSV file with Salesforce data')
  .action(async (csvFile: string) => {
    try {
      await importMetadata(csvFile);  // This should be a different function for importing data
    } catch (error) {
      console.error('Error importing data:', error);
    }
  });

program.parse(process.argv);
