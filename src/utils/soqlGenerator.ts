export const generateSOQLQueries = (metadata: any) => {
  const soqlQueries: string[] = [];

  for (const objectName in metadata) {
    const fields = metadata[objectName].map((field: any) => field.fieldName).join(', ');
    soqlQueries.push(`SELECT ${fields} FROM ${objectName}`);
  }

  return soqlQueries;
};
