import * as path from 'path';
import * as fs from 'fs';

async function checkFile(library: string, file: string): Promise<boolean> {
  const content = fs.readFileSync(file, { encoding: 'utf-8' });
  if (content.indexOf(`@diplomka-backend/${library}`) !== -1 && file.indexOf(path.normalize(library)) !== -1) {
    console.log('Byl nalezen soubor, který se odkazuje na vlastní index!');
    console.log(`\t${file}`);
    return true;
  }
  return false;
}

async function checkFilesInRecursion(library: string, dir: string, extention: string): Promise<string[]> {
  const problematicFiles = [];
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) continue;
    const stats = fs.lstatSync(filePath);
    if (stats.isDirectory()) {
      const recursiveProblematicFiles = await checkFilesInRecursion(library, filePath, extention);
      problematicFiles.push(...recursiveProblematicFiles);
    } else if (stats.isFile() && file.endsWith(extention)) {
      const invalid = await checkFile(library, filePath);
      if (invalid) {
        problematicFiles.push(filePath);
      }
    }
  }

  return problematicFiles;
}

async function checkLibraries(libraries: string[], dir: string, extention: string): Promise<string[]> {
  const problematicFiles = [];
  libraries = libraries.filter((name) => name.startsWith('@diplomka-backend')).map((name) => name.replace('@diplomka-backend/', ''));

  for (const library of libraries) {
    const recursiveProblematicFiles = await checkFilesInRecursion(library, dir, extention);
    problematicFiles.push(...recursiveProblematicFiles);
  }

  return problematicFiles;
}

async function run() {
  const tsconfig = `${path.dirname(__dirname)}/tsconfig.base.json`;
  const paths = JSON.parse(fs.readFileSync(tsconfig, { encoding: 'utf-8' })).compilerOptions.paths;
  const libs = `${path.dirname(__dirname)}/libs`;
  const problematicFiles = await checkLibraries(Object.keys(paths), libs, '.ts');
  if (problematicFiles.length != 0) {
    process.exit(1);
  }
}

run().catch((error) => console.log(error));
