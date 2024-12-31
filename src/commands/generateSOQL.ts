import * as fs from 'fs';
import * as path from 'path';
import { generateSOQLQueries } from '../utils/soqlGenerator';

export const generateSOQL = (jsonFile: string) => {
  try {
    // Read and parse JSON metadata file
    const data = fs.readFileSync(jsonFile, 'utf-8');
    const metadata = JSON.parse(data);

    // Generate SOQL queries
    const soqlQueries = generateSOQLQueries(metadata);

    // Determine output file path
    const outputDir = './csv_files/output';
    const fileName = path.basename(jsonFile, path.extname(jsonFile)); // Remove extension
    const outputFilePath = path.join(outputDir, `${fileName}_queries.soql`);

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write queries to the output file
    fs.writeFileSync(outputFilePath, soqlQueries.join('\n'), 'utf-8');
    
    console.log(`SOQL queries have been written to: ${outputFilePath}`);
  } catch (error) {
    console.error('Error generating SOQL:', error);
  }
};
