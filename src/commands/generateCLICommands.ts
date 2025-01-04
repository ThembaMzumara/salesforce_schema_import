import * as fs from "fs";
import { generateCLI } from "../utils/salesforceCliHandler";
import * as path from "path";

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

    // Ensure that metadata[objectName] is an array
    let cliCommands: string[] = [];
    for (const objectName in metadata) {
      if (Object.prototype.hasOwnProperty.call(metadata, objectName)) {
        const objectMetadata = metadata[objectName];

        // Check if the objectMetadata is an array before calling forEach
        if (Array.isArray(objectMetadata)) {
          cliCommands = generateCLI(objectMetadata);
        } else {
          console.warn(`Skipping ${objectName} as it is not an array.`);
        }
      }
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
