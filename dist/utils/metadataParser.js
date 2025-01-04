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
exports.parseCSV = void 0;
const fs = __importStar(require("fs"));
/**
 * Parse a CSV file and convert it into JSON with the field name as the key
 * and map the header columns to their respective values for each row.
 * @param csvFile - Path to the CSV file
 * @returns Parsed JSON object
 */
const parseCSV = (csvFile) => {
    try {
        // Read CSV file content
        const content = fs.readFileSync(csvFile, "utf-8");
        // Split into rows
        const rows = content.split("\n").filter((row) => row.trim() !== "");
        // Locate the header row dynamically
        const headerRowIndex = rows.findIndex((row) => row.includes("Field API Name"));
        if (headerRowIndex === -1) {
            throw new Error('No "Field API Name" header row found.');
        }
        // Extract the header row and split into columns
        const headers = rows[headerRowIndex]
            .split(",")
            .map((header) => header.trim());
        // Parse rows following the header
        const data = {};
        for (let i = headerRowIndex + 1; i < rows.length; i++) {
            const row = rows[i].split(",").map((cell) => cell.trim());
            if (row.length === 0 || row[0] === "")
                continue;
            const fieldName = row[0]; // Use the first column as the key
            // Construct the key-value object for the current row
            const rowObject = {};
            headers.forEach((header, index) => {
                rowObject[header] = row[index] || ""; // Map header to corresponding value
            });
            // Group by field name
            if (!data[fieldName]) {
                data[fieldName] = [];
            }
            data[fieldName].push(rowObject);
        }
        return data;
    }
    catch (error) {
        console.error("Error parsing CSV:", error);
        throw error;
    }
};
exports.parseCSV = parseCSV;
