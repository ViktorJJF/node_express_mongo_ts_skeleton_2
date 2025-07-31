import fs from 'fs';
import path from 'path';

const modelsPath = `${__dirname}/`;

async function loadModels() {
  /*
   * Load models dynamically
   */

  // Read all files in the directory
  const files = fs.readdirSync(modelsPath);
  for (const file of files) {
    // Get the name of the file without its extension
    const modelFile = path.basename(file, path.extname(file));

    // Prevents loading of this file
    if (modelFile !== 'index') {
      // Dynamically import the model
      await import(`./${modelFile}`);
    }
  }
}

export default loadModels;
