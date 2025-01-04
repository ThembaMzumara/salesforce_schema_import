import * as fs from "fs";
import * as path from "path";

/**
 * Generate Salesforce SOQL CREATE query from a JSON metadata file.
 * @param jsonFile - The path to the JSON file containing the object and field metadata.
 */
export const generateSOQL = (jsonFile: string) => {
  try {
    // Read the file content
    const data = fs.readFileSync(jsonFile, "utf-8");

    // Parse the JSON data
    let metadata;
    try {
      metadata = JSON.parse(data);
    } catch (error) {
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
    const fields = metadata[objectName]?.fields; // Access the "fields" array inside the object metadata

    if (Array.isArray(fields)) {
      // Iterate over the fields to generate the query
      fields.forEach((field: any, index: number) => {
        const fieldName = field.fieldName;
        const fieldType = field.fieldType || "Text"; // Default to 'Text' if no fieldType is specified

        // Add the field to the query
        createQuery += `  ${fieldName}: ${fieldType}${index < fields.length - 1 ? "," : ""}\n`;
      });
    } else {
      console.warn("No fields found or fields are not in an array format.");
    }

    createQuery += `)\n`;

    // Write the query to the output file
    fs.writeFileSync(outputFilePath, createQuery, "utf-8");

    console.log(`CREATE SOQL query has been written to: ${outputFilePath}`);
  } catch (error) {
    console.error("Error generating CREATE SOQL:", error);
  }
};
