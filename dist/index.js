#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const child_process_1 = require("child_process"); // Use spawnSync for subprocess execution
const generateSOQL_1 = require("./commands/generateSOQL");
const generateCLICommands_1 = require("./commands/generateCLICommands");
const path = __importStar(require("path"));
// Function to run a Python script within a virtual environment
function runPythonScriptWithVenv(scriptPath, inputCsv) {
    try {
        // Hardcode the output directory
        const outputDir = 'csv_files/output_data';
        // Escape the input CSV argument for safe shell execution
        const sanitizedInputCsv = `"${inputCsv.replace(/(["$`\\])/g, '\\$1')}"`;
        // Define the venv activation and script execution command with hardcoded output directory
        const venvActivateCommand = `bash -c "source ${path.resolve('./python_src/venv/bin/activate')} && python3 ${scriptPath} ${sanitizedInputCsv} ${outputDir}"`;
        // Execute the command using spawnSync
        const result = (0, child_process_1.spawnSync)(venvActivateCommand, {
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
    }
    catch (error) {
        console.error('❌ Error running Python script with venv:', error);
    }
}
commander_1.program
    .name('ssm')
    .description('CLI tool to migrate Salesforce schema metadata and data')
    .version('1.0.0')
    .usage('[options] [command]');
// Command to import metadata from CSV to JSON
commander_1.program
    .command('import-metadata')
    .description('Import metadata from a CSV file and process it into a structured format')
    .argument('<csvFile>', 'Path to the CSV file containing Salesforce metadata')
    .action((csvFile) => {
    try {
        const scriptPath = path.resolve('./python_src/process_csv.py');
        runPythonScriptWithVenv(scriptPath, csvFile);
    }
    catch (error) {
        console.error('❌ Error importing metadata:', error);
    }
});
// Command to generate SOQL queries from JSON
commander_1.program
    .command('generate-soql')
    .description('Generate Salesforce Object Query Language (SOQL) queries based on provided metadata JSON')
    .argument('<jsonFile>', 'Path to the JSON file containing parsed metadata')
    .action((jsonFile) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, generateSOQL_1.generateSOQL)(jsonFile);
    }
    catch (error) {
        console.error('❌ Error generating SOQL:', error);
    }
}));
// Command to generate Salesforce CLI commands for creating objects/fields
commander_1.program
    .command('generate-cli')
    .description('Generate Salesforce CLI commands based on metadata JSON for schema migration')
    .argument('<jsonFile>', 'Path to the JSON file containing parsed metadata')
    .action((jsonFile) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, generateCLICommands_1.generateCLICommands)(jsonFile);
    }
    catch (error) {
        console.error('❌ Error generating CLI commands:', error);
    }
}));
commander_1.program.on('option:help', () => {
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
commander_1.program.parse(process.argv);
