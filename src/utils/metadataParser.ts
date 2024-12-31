import * as fs from 'fs';

/**
 * Parse a CSV file and convert it into JSON with the field name as the key
 * and the entire row (as a single string) as the attributes.
 * @param csvFile - Path to the CSV file
 * @returns Parsed JSON object
 */
export const parseCSV = (csvFile: string) => {
  try {
    // Read CSV file content
    const content = fs.readFileSync(csvFile, 'utf-8');

    // Split into rows
    const rows = content.split('\n').filter(row => row.trim() !== '');

    // Locate the header row dynamically
    const headerRowIndex = rows.findIndex(row => row.includes('Field API Name'));
    if (headerRowIndex === -1) {
      throw new Error('No "Field API Name" header row found.');
    }

    // Parse rows following the header
    const data: Record<string, any[]> = {};
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i].split('\t').map(cell => cell.trim());
      if (row.length === 0 || row[0] === '') continue;

      const fieldName = row[0]; // Use the first column as the key
      const fullRowString = rows[i].trim(); // Keep the entire row as a single string

      // Group by field name
      if (!data[fieldName]) {
        data[fieldName] = [];
      }
      data[fieldName].push({ fullRowString });
    }

    return data;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw error;
  }
};
