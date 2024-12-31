import * as fs from 'fs';
import { parseCSV } from '../utils/metadataParser';
import path from 'path';

/**
 * Convert CSV metadata to JSON format while retaining all columns dynamically.
 * @param csvFile - Path to the input CSV file
 */
export const importMetadata = (csvFile: string) => {
  try {
    const jsonData = parseCSV(csvFile);
    const jsonFilePath = `./csv_files/output/${path.basename(csvFile, '.csv')}.json`;
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));
    console.log(`Metadata successfully imported to ${jsonFilePath}`);
  } catch (error) {
    console.error('Error importing metadata:', error);
  }
};
