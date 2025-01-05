import * as fs from "fs";
import * as path from "path";
import { generateCLI } from "../utils/salesforceCliHandler";

interface CLIObject {
  fieldName: string;
  fieldType: string;
}

export const generateCLICommands = (jsonFile: string) => {
  try {
    // Read the file
    const data = fs.readFileSync(jsonFile, "utf-8");

    // Ensure the file is valid JSON
    let metadata;
    try {
      metadata = JSON.parse(data);
    } catch (parseError) {
      console.error(
        "Error: The file is not valid JSON. Please check its structure.",
      );
      return;
    }

    // Convert metadata to array format for the CLI generation
    let cliCommands: string[] = [];
    let objects: CLIObject[] = [];

    // Ensure metadata is structured as expected
    for (const objectName in metadata) {
      if (Object.prototype.hasOwnProperty.call(metadata, objectName)) {
        const objectMetadata = metadata[objectName];

        // Ensure objectMetadata is an object and has a 'fields' array
        if (
          objectMetadata &&
          objectMetadata.fields &&
          Array.isArray(objectMetadata.fields)
        ) {
          // Create an array with field name and type objects
          objectMetadata.fields.forEach((field: any) => {
            objects.push({
              fieldName: field.fieldName,
              fieldType: field.fieldType || "Text", // Default to 'Text' if fieldType is missing
            });
          });
        } else {
          console.warn(
            `Skipping ${objectName} as it does not have valid fields.`,
          );
        }
      }
    }

    // Ensure the array has content before passing to generateCLI
    if (objects.length > 0) {
      cliCommands = generateCLI(objects);
    } else {
      console.warn("No valid fields to generate CLI commands.");
    }

    // Ensure output directory exists
    const outputDir = "./csv_files/cli_output/";
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Create output file name
    const outputFileName = path.join(outputDir, "cli_commands.soql");

    // Write commands to the file
    fs.writeFileSync(outputFileName, cliCommands.join("\n"), "utf-8");
    console.log(`CLI commands have been written to: ${outputFileName}`);
  } catch (error) {
    console.error("Error generating CLI commands:", error);
  }
};
