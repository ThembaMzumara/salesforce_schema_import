import * as fs from 'fs';
import { parseCSV } from '../utils/metadataParser';

export const importMetadata = (csvFile: string) => {
  try {
    const jsonData = parseCSV(csvFile);
    const jsonFilePath = `${csvFile}.json`;
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));
    console.log(`Metadata successfully imported to ${jsonFilePath}`);
  } catch (error) {
    console.error('Error importing metadata:', error);
  }
};
