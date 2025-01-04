"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCLI = void 0;
const generateCLI = (metadata) => {
    const cliCommands = [];
    // Define mapping for standard fields to CLI flags
    const fieldFlagMapping = {
        "Field API Name": "-n",
        "Field Label": "-l",
        "Help Text": "-d",
        Length: "--length",
        "Is Required on Create": "--required",
    };
    for (const objectName in metadata) {
        // Create object command
        const createObjectCommand = `sfdx force:object:create -n ${objectName}`;
        cliCommands.push(createObjectCommand);
        // Iterate over fields for the object
        metadata[objectName].forEach((field) => {
            const fieldName = field["Field API Name"] || "Unknown_Field";
            const fieldType = field["Data Type"] || "Unknown_Type";
            // Start building the field command
            let createFieldCommand = `sfdx force:field:create -t ${fieldType} -r ${objectName}`;
            // Dynamically add mapped fields
            for (const [jsonKey, cliFlag] of Object.entries(fieldFlagMapping)) {
                if (field[jsonKey]) {
                    const value = field[jsonKey];
                    createFieldCommand += ` ${cliFlag} "${value}"`;
                }
            }
            // Handle special cases
            if (fieldType.includes("Formula") && field["Formula Text"]) {
                createFieldCommand += ` --formula "${field["Formula Text"]}"`;
            }
            if (fieldType === "Picklist" && Array.isArray(field["Picklist Values"])) {
                createFieldCommand += ` --picklist-values "${field["Picklist Values"].join(";")}"`;
            }
            cliCommands.push(createFieldCommand.trim());
        });
    }
    return cliCommands;
};
exports.generateCLI = generateCLI;
