#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const program = require('commander');
const readline = require('readline');

// Functions

function getFileAndNewFilePaths(filePath, program, idx) {
  if (!fs.existsSync(filePath)) return '';
  const filePathStats = fs.statSync(filePath);
  if (!filePathStats || !filePathStats.isFile()) return '';

  let filename = path.basename(filePath);
  const fileExt = path.extname(filename);
  const dirname = path.dirname(filePath);
  filename = filename.substr(0, filename.length - fileExt.length);

  if (program.discardOriginalname) filename = program.prefix;
  else filename = program.prefix + filename;

  if (program.sufixAfterExtension) {
    if (program.mode === 'number') filename += idx;

    filename += fileExt + program.sufix;
  } else {
    if (program.mode === 'number') filename += program.sufix + idx;
    else filename += program.sufix;

    filename += fileExt;
  }

  return [filePath, path.join(dirname, filename)];
}

// Init

program.version('1.0.0')
  .usage('[options] <files>')
  .option('-m, --mode <number|custom>', 'Renaming mode (number|custom)', /^(number|custom)$/)
  .option('-p, --prefix <name>', 'Prefix for the new filename', '')
  .option('-s, --sufix <name>', 'Sufix for the new filename', '')
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
    newFiles.forEach(el => console.log(el[1]));

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('\nContinue? y/n: ', (answer) => {
      if (answer === 'y') {
        newFiles.forEach(((el) => { fs.renameSync(el[0], el[1]); }));
      }

      rl.close();
    });
  }
}

