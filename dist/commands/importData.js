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
exports.importData = void 0;
const csvReader_1 = require("../utils/csvReader"); // Utility to read CSV files
const salesforceCliHandler_1 = require("../utils/salesforceCliHandler"); // Function to deploy data using Salesforce CLI
const importData = (csvFile) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Step 1: Parse CSV into records (assumes CSV is in a specific format for Salesforce)
        const records = yield (0, csvReader_1.readCSV)(csvFile);
        // Step 2: Use Salesforce CLI or API to push this data to Salesforce
        yield (0, salesforceCliHandler_1.deployDataToSalesforce)(records);
    }
    catch (error) {
        console.error('Error in importData:', error);
        throw new Error('Failed to import data');
    }
});
exports.importData = importData;
