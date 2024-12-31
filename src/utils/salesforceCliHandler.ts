export const generateCLI = (metadata: any) => {
  const cliCommands: string[] = [];

  for (const objectName in metadata) {
    const createObjectCommand = `sfdx force:object:create -n ${objectName}`;
    cliCommands.push(createObjectCommand);

    metadata[objectName].forEach((field: any) => {
      const createFieldCommand = `sfdx force:field:create -n ${field.fieldName} -t ${field.fieldType} -l "${field.label}" -r ${objectName}`;
      cliCommands.push(createFieldCommand);
    });
  }

  return cliCommands;
};
