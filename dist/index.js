#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const child_process_1 = require("child_process"); // Use spawnSync for synchronous execution
const generateSOQL_1 = require("./commands/generateSOQL");
const generateCLICommands_1 = require("./commands/generateCLICommands");
commander_1.program
    .name('ssm')
    .description('CLI tool to migrate Salesforce schema metadata and data')
    .version('1.0.0');
// Command to import metadata from CSV to JSON
commander_1.program
    .command('import-metadata')
    .description('Import metadata from a CSV file')
    .argument('<csvFile>', 'CSV file with Salesforce metadata')
    .action((csvFile) => {
    try {
        const outputDir = './csv_files/'; // Specify or generate dynamically
        // Use spawnSync to run the Python script
        const pythonProcess = (0, child_process_1.spawnSync)('python3', ['python_src/process_csv.py', csvFile, outputDir], {
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
    }
    catch (error) {
        console.error('Error importing metadata using Python script:', error);
    }
});
// Command to generate SOQL queries from JSON
commander_1.program
    .command('generate-soql')
    .description('Generate SOQL queries from metadata JSON')
    .argument('<jsonFile>', 'JSON file with parsed metadata')
    .action((jsonFile) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, generateSOQL_1.generateSOQL)(jsonFile);
    }
    catch (error) {
        console.error('Error generating SOQL:', error);
    }
}));
// Command to generate Salesforce CLI commands for creating objects/fields
commander_1.program
    .command('generate-cli')
    .description('Generate Salesforce CLI commands from metadata JSON')
    .argument('<jsonFile>', 'JSON file with parsed metadata')
    .action((jsonFile) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, generateCLICommands_1.generateCLICommands)(jsonFile);
    }
    catch (error) {
        console.error('Error generating CLI commands:', error);
    }
}));
commander_1.program.parse(process.argv);
