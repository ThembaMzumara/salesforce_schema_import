import * as fs from 'fs';

export const parseCSV = (csvFile: string) => {
  const data = fs.readFileSync(csvFile, 'utf-8');
  const rows = data.split('\n').map((line) => line.split(','));
  const metadata: { [key: string]: any[] } = {};

  rows.forEach((row) => {
    const [objectName, fieldName, fieldType, label] = row;
    if (!metadata[objectName]) metadata[objectName] = [];
    metadata[objectName].push({ fieldName, fieldType, label });
  });

  return metadata;
};
