#! /usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const program = require('commander');
const readline = require('readline');

// Functions

function getFileAndNewFilePaths(filePath, program, idx) {
  if (!fs.existsSync(filePath)) return '';
  const filePathStats = fs.statSync(filePath);
  if (!filePathStats || !filePathStats.isFile()) return '';

  const pathParsed = path.parse(filePath);
  let filename = pathParsed.name;
  const fileExt = pathParsed.ext;
  const dirname = pathParsed.dir;
  const prefix = program.prefix.replace(/\[1\]/g, filename);
  const sufix = program.sufix.replace(/\[1\]/g, filename);

  if (program.discardOriginalname) filename = prefix;
  else filename = prefix + filename;

  if (program.sufixAfterExtension) {
    if (program.mode === 'number') filename += idx;

    filename += fileExt + sufix;
  } else {
    if (program.mode === 'number') filename += sufix + idx;
    else filename += sufix;

    filename += fileExt;
  }

  return {
    filePath,
    newPath: path.join(dirname, filename),
    base: filename,
    name: pathParsed.name
  };
}

// Init

program.version('1.0.0')
  .usage('[options] <files>')
  .option('-m, --mode <number>', 'Renaming mode (number)', /^(number)$/)
  .option('-p, --prefix <name>', 'Prefix for the new filename. Placeholder [1] for filename (no ext)', '')
  .option('-s, --sufix <name>', 'Sufix for the new filename Placeholder [1] for filename (no ext)', '')
  .option('-d, --discard-originalname', 'Discard original name', false)
  .option('-x, --sufix-after-extension', 'If the sufix should be after file extension', false)
  .parse(process.argv);

if (process.argv.length === 2) {
  program.help();
} else {
  const newFiles = program.args
    .map((filePath, i) => getFileAndNewFilePaths(filePath, program, i))
    .filter(el => el !== '');

  if (newFiles.length === 0) {
    console.log('No files matched!');
  } else {
    console.log('Renaming files to:');
    newFiles.forEach(el => console.log(el.newPath));

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('\nContinue? y/n: ', answer => {
      if (answer === 'y') {
        newFiles.forEach((el => { fs.moveSync(el.filePath, el.newPath); }));
      }

      rl.close();
    });
  }
}

