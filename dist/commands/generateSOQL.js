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
exports.generateSOQL = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Generate Salesforce SOQL CREATE queries from metadata object
 * @param jsonFile - The path to the JSON file containing the object and field metadata
 */
const generateSOQL = (jsonFile) => {
    try {
        // Read the file content
        const data = fs.readFileSync(jsonFile, 'utf-8');
        console.log('File content:', data); // Log file content for debugging
        // Parse the JSON data
        let metadata;
        try {
            metadata = JSON.parse(data);
        }
        catch (error) {
            console.error('Failed to parse JSON. File content:', data);
            throw error; // Exit if the file content isn't valid JSON
        }
        // Prepare the output directory and file name
        const outputDir = './csv_files/output';
        const outputFilePath = path.join(outputDir, 'create_queries.soql');
        // Ensure the output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        // Start building the CREATE queries
        const createQueries = [];
        // Iterate over each object in the metadata
        for (const objectName in metadata) {
            if (Object.prototype.hasOwnProperty.call(metadata, objectName)) {
                const fields = metadata[objectName];
                let query = `CREATE OBJECT ${objectName} (\n`;
                // Iterate over the rows (fields) of the object and build the query
                fields.forEach((field, index) => {
                    const fieldName = field.fieldName;
                    const fieldType = field.fieldType || 'Text'; // Default to 'Text' if no fieldType is specified
                    // Add the field to the query
                    query += `  ${fieldName}: ${fieldType}${index < fields.length - 1 ? ',' : ''}\n`;
                });
                query += `)`;
                // Push the query for this object to the array
                createQueries.push(query);
            }
        }
        // Write queries to the output file
        fs.writeFileSync(outputFilePath, createQueries.join('\n\n'), 'utf-8');
        console.log(`CREATE SOQL queries have been written to: ${outputFilePath}`);
    }
    catch (error) {
        console.error('Error generating CREATE SOQL:', error);
    }
};
exports.generateSOQL = generateSOQL;
