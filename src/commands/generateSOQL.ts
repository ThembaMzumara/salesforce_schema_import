import * as fs from 'fs';
import * as path from 'path';

/**
 * Generate Salesforce SOQL CREATE queries from metadata object
 * @param jsonFile - The path to the JSON file containing the object and field metadata
 */
export const generateSOQL = (jsonFile: string) => {
  try {
    // Read the file content
    const data = fs.readFileSync(jsonFile, 'utf-8');
    console.log('File content:', data);  // Log file content for debugging

    // Parse the JSON data
    let metadata;
    try {
      metadata = JSON.parse(data);
    } catch (error) {
      console.error('Failed to parse JSON. File content:', data);
      throw error;  // Exit if the file content isn't valid JSON
    }

    // Prepare the output directory and file name
    const outputDir = './csv_files/output';
    const outputFilePath = path.join(outputDir, 'create_queries.soql');

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Start building the CREATE queries
    const createQueries: string[] = [];

    // Iterate over each object in the metadata
    for (const objectName in metadata) {
      if (Object.prototype.hasOwnProperty.call(metadata, objectName)) {
        const fields = metadata[objectName];
        
        let query = `CREATE OBJECT ${objectName} (\n`;

        // Iterate over the rows (fields) of the object and build the query
        fields.forEach((field: any, index: number) => {
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
  } catch (error) {
    console.error('Error generating CREATE SOQL:', error);
  }
};
