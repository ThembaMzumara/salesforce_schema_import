import * as fs from "fs";

/**
 * Parse a CSV file and convert it into JSON with the field name as the key
 * and map the header columns to their respective values for each row.
 * @param csvFile - Path to the CSV file
 * @returns Parsed JSON object
 */
export const parseCSV = (csvFile: string) => {
  try {
    // Read CSV file content
    const content = fs.readFileSync(csvFile, "utf-8");

    // Split into rows
    const rows = content.split("\n").filter((row) => row.trim() !== "");

    // Locate the header row dynamically
    const headerRowIndex = rows.findIndex((row) =>
      row.includes("Field API Name"),
    );
    if (headerRowIndex === -1) {
      throw new Error('No "Field API Name" header row found.');
    }

    // Extract the header row and split into columns
    const headers = rows[headerRowIndex]
      .split(",")
      .map((header) => header.trim());

    // Parse rows following the header
    const data: Record<string, any[]> = {};
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i].split(",").map((cell) => cell.trim());
      if (row.length === 0 || row[0] === "") continue;

      const fieldName = row[0]; // Use the first column as the key

      // Construct the key-value object for the current row
      const rowObject: Record<string, string> = {};
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
  } catch (error) {
    console.error("Error parsing CSV:", error);
    throw error;
  }
};
