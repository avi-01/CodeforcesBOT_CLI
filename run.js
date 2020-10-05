const colors = require("colors");
const fs = require("fs");
const { argv } = require("yargs");
const { exec } = require("shelljs");
const { join } = require("path");
const { table } = require("table");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const contestCode = argv.contestCode ? argv.contestCode : process.argv[2];
const problemId = argv.problemId ? argv.problemId : process.argv[3];

const problemPath = join(__dirname, "..", "Codeforces",contestCode,problemId);
const config = JSON.parse(readFile(join(__dirname, "config.json")));

main();

function main() {
  checkExist("problemId", problemId);
  checkExist(problemPath, fs.existsSync(problemPath));

  compileProgram();

  getOuput();
}

function compileProgram() {
  console.log("Compiling...".yellow);
  const compiler = config.compiler ? config.compiler : "g++";
  const std = config.std ? config.std : "c++11";
  const fileName = join(problemPath, problemId+".cpp");
  const fileSave = join(problemPath, "sol");

  checkExist(fileName, fs.existsSync(fileName));

  const cmd = `${compiler} --std=${std} -o ${fileSave} ${fileName}`;

  if (exec(cmd).code !== 0) {
    handleError(`${fileName} failed to build. Check for errors.`);
  } else {
    console.log("Compiled Successfully".green);
  }
}

function getOuput() {
  try {
    const fileName = join(problemPath, "sol");
    const inputFolder = join(problemPath, "input");
    const outputFolder = join(problemPath, "output");
    const codeOutputFolder = join(problemPath, "codeOutput");

    checkExist(inputFolder, fs.existsSync(inputFolder));
    checkExist(outputFolder, fs.existsSync(outputFolder));

    if (!fs.existsSync(codeOutputFolder)) {
      fs.mkdirSync(codeOutputFolder);
    }

    const inputs = fs.readdirSync(inputFolder);
    const outputs = fs.readdirSync(outputFolder);

    let failedTestCases = [];

    inputs.forEach((inputNo, i) => {
      const outputFile = join(outputFolder, outputs[i]);
      const inputFile = join(inputFolder, inputNo);
      const codeOutputFile = join(codeOutputFolder, `codeOutput${i}.txt`);

      
      const cmd = `${fileName} < ${inputFile}`;

      const { stdout, stderr, code }  = exec(cmd, { silent: true });

      if (code !== 0) {
        handleError("Solution doest not run for the input" + i);
      }
      
      const modOut = stdout.replace( /(\r\n)+/g, "\n" ).replace( /\r+/g, "\n" ).trim();
      
      createFile(codeOutputFile, modOut);

      if (!testOutput(codeOutputFile, outputFile, i)) {
        failedTestCases.push({
          no: i,
          input: inputFile,
          output: outputFile,
          codeOutput: codeOutputFile,
        });
      }
    });

    if (failedTestCases.length === 0) {
      console.log("All TestCases Passed".green);
      process.exit();
    } else {
      console.log(("\n" + failedTestCases.length + " TestCases failed").red);

      readline.question(
        "Do you want to see the failed test-cases? (y/N): ",
        (ans) => {
          if (ans === "y" || ans === "Y" || ans == 1) {
            outputTestCases(failedTestCases);
          }

          readline.close();
        }
      );
    }
  } catch (err) {
    handleError(err);
  }
}

function testOutput(codeOutputFile, outputFile, testNo) {
  const codeOutput = fs.readFileSync(codeOutputFile).toString().trim();
  const output = fs.readFileSync(outputFile).toString().trim();

  if (codeOutput === output) {
    console.log("TestCase " + testNo + " passed \u2714".green);
    return 1;
  } else {
    console.log("TestCase " + testNo + " failed \u2718".red);
    return 0;
  }
}

function outputTestCases(failedTestCases) {
  let data = [["No".cyan, "Input".cyan, "Output".cyan, "CodeOutput".cyan]];

  failedTestCases.forEach((failedTestCase) => {
    const no = failedTestCase.no;
    const input = fs.readFileSync(failedTestCase.input).toString();
    const output = fs.readFileSync(failedTestCase.output).toString();
    const codeOutput = fs.readFileSync(failedTestCase.codeOutput).toString();

    data.push([no,input, output, codeOutput]);
  });

  console.log(table(data));
}

function createFile(fileName, test_case) {
  fs.writeFileSync(fileName, test_case, (err) => err ? handleError(err) : null);
}


function readFile(file) {
  checkExist(file, fs.existsSync(file));
  return fs.readFileSync(file);
}

function checkExist(obj, exist) {
  if (!exist) handleError(obj + " does not Exist");
}

function handleError(error) {
  console.log("Got an Error. Please try again!!!".red);
  console.error(error.cyan);
  process.exit();
}
