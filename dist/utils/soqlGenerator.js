"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSOQLQueries = void 0;
const generateSOQLQueries = (metadata) => {
    const soqlQueries = [];
    for (const objectName in metadata) {
        const fields = metadata[objectName].map((field) => field.fieldName).join(', ');
        soqlQueries.push(`SELECT ${fields} FROM ${objectName}`);
    }
    return soqlQueries;
};
exports.generateSOQLQueries = generateSOQLQueries;
