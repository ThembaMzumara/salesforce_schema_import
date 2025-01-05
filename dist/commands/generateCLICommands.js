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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCLICommands = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const salesforceCliHandler_1 = require("../utils/salesforceCliHandler");
const generateCLICommands = (jsonFile) => {
    try {
        // Read the file
        const data = fs.readFileSync(jsonFile, "utf-8");
        // Ensure the file is valid JSON
        let metadata;
        try {
            metadata = JSON.parse(data);
        }
        catch (parseError) {
            console.error("Error: The file is not valid JSON. Please check its structure.");
            return;
        }
        // Convert metadata to array format for the CLI generation
        let cliCommands = [];
        let objects = [];
        // Ensure metadata is structured as expected
        for (const objectName in metadata) {
            if (Object.prototype.hasOwnProperty.call(metadata, objectName)) {
                const objectMetadata = metadata[objectName];
                // Ensure objectMetadata is an object and has a 'fields' array
                if (objectMetadata && objectMetadata.fields && Array.isArray(objectMetadata.fields)) {
                    // Create an array with field name and type objects
                    objectMetadata.fields.forEach((field) => {
                        objects.push({
                            fieldName: field.fieldName,
                            fieldType: field.fieldType || "Text", // Default to 'Text' if fieldType is missing
                        });
                    });
                }
                else {
                    console.warn(`Skipping ${objectName} as it does not have valid fields.`);
                }
            }
        }
        // Ensure the array has content before passing to generateCLI
        if (objects.length > 0) {
            cliCommands = (0, salesforceCliHandler_1.generateCLI)(objects);
        }
        else {
            console.warn("No valid fields to generate CLI commands.");
        }
        // Ensure output directory exists
        const outputDir = "./csv_files/cli_output/";
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        // Create output file name
        const outputFileName = path.join(outputDir, "cli_commands.soql");
        // Write commands to the file
        fs.writeFileSync(outputFileName, cliCommands.join("\n"), "utf-8");
        console.log(`CLI commands have been written to: ${outputFileName}`);
    }
    catch (error) {
        console.error("Error generating CLI commands:", error);
    }
};
exports.generateCLICommands = generateCLICommands;
