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
 * Generate Salesforce SOQL CREATE query from a JSON metadata file.
 * @param jsonFile - The path to the JSON file containing the object and field metadata.
 */
const generateSOQL = (jsonFile) => {
    var _a;
    try {
        // Read the file content
        const data = fs.readFileSync(jsonFile, "utf-8");
        // Parse the JSON data
        let metadata;
        try {
            metadata = JSON.parse(data);
        }
        catch (error) {
            console.error("Failed to parse JSON. File content:", data);
            throw error; // Exit if the file content isn't valid JSON
        }
        // Prepare the output directory and file name
        const outputDir = "./csv_files/soql_output";
        const outputFilePath = path.join(outputDir, "create_queries.soql");
        // Ensure the output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        // Start building the CREATE query
        let createQuery = "";
        // First, get the object name (e.g., "Account")
        let objectName = "";
        for (const objectKey in metadata) {
            if (Object.prototype.hasOwnProperty.call(metadata, objectKey)) {
                if (objectKey !== "OBJECT API NAME") {
                    objectName = objectKey; // The object name is found here
                    break;
                }
            }
        }
        if (!objectName) {
            console.error("No object name found!");
            return;
        }
        // Start building the CREATE query for the object
        createQuery = `CREATE OBJECT ${objectName} (\n`;
        // Get the fields from the object
        const fields = (_a = metadata[objectName]) === null || _a === void 0 ? void 0 : _a.fields; // Access the "fields" array inside the object metadata
        // Create a Set to track added fields and avoid duplicates
        const addedFields = new Set();
        if (Array.isArray(fields)) {
            // Iterate over the fields to generate the query
            fields.forEach((field, index) => {
                const fieldName = field.fieldName;
                const fieldType = field.fieldType || "Text"; // Default to 'Text' if no fieldType is specified
                // Check if the field has already been added to avoid duplicates
                if (!addedFields.has(fieldName)) {
                    // Add the field to the query
                    createQuery += `  ${fieldName}: ${fieldType}${index < fields.length - 1 ? "," : ""}\n`;
                    // Mark this field as added
                    addedFields.add(fieldName);
                }
            });
        }
        else {
            console.warn("No fields found or fields are not in an array format.");
        }
        createQuery += `)\n`;
        // Write the query to the output file
        fs.writeFileSync(outputFilePath, createQuery, "utf-8");
        console.log(`CREATE SOQL query has been written to: ${outputFilePath}`);
    }
    catch (error) {
        console.error("Error generating CREATE SOQL:", error);
    }
};
exports.generateSOQL = generateSOQL;
