"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCLI = void 0;
const generateCLI = (metadata) => {
    const cliCommands = [];
    for (const objectName in metadata) {
        const createObjectCommand = `sfdx force:object:create -n ${objectName}`;
        cliCommands.push(createObjectCommand);
        metadata[objectName].forEach((field) => {
            const createFieldCommand = `sfdx force:field:create -n ${field.fieldName} -t ${field.fieldType} -l "${field.label}" -r ${objectName}`;
            cliCommands.push(createFieldCommand);
        });
    }
    return cliCommands;
};
exports.generateCLI = generateCLI;
