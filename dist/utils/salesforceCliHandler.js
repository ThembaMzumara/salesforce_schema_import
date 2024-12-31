"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCLI = void 0;
const generateCLI = (metadata) => {
    const cliCommands = [];
    for (const objectName in metadata) {
        // Create object command
        const createObjectCommand = `sfdx force:object:create -n ${objectName}`;
        cliCommands.push(createObjectCommand);
        // Iterate over fields for the object
        metadata[objectName].forEach((field) => {
            const fieldName = field["Field API Name"] || "Unknown_Field";
            const fieldType = field["Data Type"] || "Unknown_Type";
            const label = field["Field Label"] || "";
            // Generate field command
            const createFieldCommand = `sfdx force:field:create -n ${fieldName} -t ${fieldType} -l "${label}" -r ${objectName}`;
            cliCommands.push(createFieldCommand);
        });
    }
    return cliCommands;
};
exports.generateCLI = generateCLI;
