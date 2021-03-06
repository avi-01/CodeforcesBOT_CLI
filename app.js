const axios = require("axios");
const cheerio = require("cheerio");
const colors = require("colors");
const fs = require("fs");
const { argv } = require("yargs");
const { join } = require("path");
const { exec } = require("shelljs");

// #TODO You need Puppeteer to create pdf. After installing Puppeteer (npm i puppeteer --save)
//uncomment required and these line to create pdf.)
// const puppeteer = require("puppeteer");

const contestCode = argv.contestCode
  ? argv.contestCode.toString()
  : process.argv[2];
const pdfTrue = argv.pdfTrue ? argv.pdfTrue : process.argv[3];
const config = JSON.parse(readFile(join(__dirname, "config.json")));

if (contestCode == null) {
  console.log("Please enter the contest code".red);
  return;
}

const dir = join(__dirname, "..", "Codeforces", contestCode);
const assetsDir = join(__dirname, "assets");
const baseUrl = "https://codeforces.com";

axios.defaults.baseURL = baseUrl;

createReqFiles();
getQuestions();

async function createReqFiles() {
  await createDir(join(__dirname, "..", "Codeforces"));
  await createDir(dir);
}

async function getQuestions() {
  console.log("Fetching the data...".yellow);

  const problemsId = await getProblemsID();

  let getTestCasesPromises = [];

  problemsId.forEach((id) => {
    getTestCasesPromises.push(getProblemTestCase(id));
  });

  if (typeof puppeteer !== "undefined" && (pdfTrue == "true" || pdfTrue == 1))
    getProblemStatement(problemsId);

  await Promise.all(getTestCasesPromises);

  if (config.openFileInVsCode) openProblemsFiles(problemsId);
}

function getProblemStatement(problemsId, id) {
  problemsId.forEach((id) => {
    printPDF(
      baseUrl + "/contest/" + contestCode + "/problem/" + id,
      dir + "/" + id + "/" + id + ".pdf",
      id
    );
  });
}

function getProblemsID() {
  return axios
    .get("/contest/" + contestCode)
    .then((res) => {
      const $ = cheerio.load(res.data);

      const problems_table = $(".id a");

      let problemsId = [];

      problems_table.each(function (i, elem) {
        problemsId[i] = $(elem).text().trim();
      });

      return problemsId;
    })
    .catch((err) => handleError());
}

function getProblemTestCase(problemId) {
  return axios
    .get("/contest/" + contestCode + "/problem/" + problemId)
    .then(async (res) => {
      const $ = cheerio.load(res.data);

      let test_cases = [];

      $(".sample-tests .input pre").each(function (i, elem) {
        test_cases[i] = { input: $(elem).text().trim() };
      });

      $(".sample-tests .output pre").each(function (i, elem) {
        test_cases[i] = {
          ...test_cases[i],
          output: $(elem).text().trim() + "\n",
        };
      });

      storeTestCases(problemId, test_cases);
    })
    .catch((err) => handleError());
}

async function storeTestCases(problemId, test_cases) {
  const problem_dir = join(dir, problemId);

  createDir(problem_dir);
  createDir(join(problem_dir, "input"));
  createDir(join(problem_dir, "output"));
  createDir(join(problem_dir, "codeOutput"));

  if (!fs.existsSync(join(problem_dir, "sol.cpp"))) {
    if (!fs.existsSync(join(__dirname, "template.cpp")))
      await fs.copyFile(
        join(assetsDir, "template.cpp"),
        join(problem_dir, problemId + ".cpp"),
        (err) => (err ? handleError(err) : null)
      );
    else
      await fs.copyFile(
        join(__dirname, "template.cpp"),
        join(problem_dir, problemId + ".cpp"),
        (err) => (err ? handleError(err) : null)
      );
  }

  test_cases.forEach((test_case, i) => {
    if (i == 0) {
      createFile(join(problem_dir, problemId+"_in.txt"), test_case.input);
      createFile(join(problem_dir, problemId+"_out.txt"), test_case.output);
    }
    createFile(
      join(problem_dir, "input", "input" + i + ".txt"),
      test_case.input
    );
    createFile(
      join(problem_dir, "output", "output" + i + ".txt"),
      test_case.output
    );
  });

  console.log("Saved ".green + "TestCases " + problemId);
}

function openProblemsFiles(problemsId) {
  problemsId.forEach((id) => {
    openProblemSolFile(id);
  });

}

function openProblemSolFile(problemId) {
  const problemSolFile = join(dir, problemId, problemId + ".cpp");
  const row = config.templateLineNo ? config.templateLineNo : 0;

  openFileCode(problemSolFile, row);
}

function openFileCode(filePath, row = 0, col = 0) {
  const cmd = `code ${filePath}:${row}:${col} -r -g`;
  execCmd(cmd);
}

function execCmd(cmd) {
  const { stdout, stderr, code } = exec(cmd, { silent: true });

  if (code !== 0) {
    handleError("Error in opening file" + i);
  }
}

function readFile(file) {
  checkExist(file, fs.existsSync(file));
  return fs.readFileSync(file);
}

function createDir(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

function createFile(fileName, test_case) {
  fs.writeFileSync(fileName, test_case, (err) =>
    err ? handleError(err) : null
  );
}

function checkExist(obj, exist) {
  if (!exist) handleError(obj + " does not Exist");
}

async function printPDF(url, path, id) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });
    await page.pdf({ path: path });

    await browser.close();

    console.log("Downloaded ".green + "Problem " + id);
  } catch (err) {
    handleError(err);
  }
}

function handleError(error) {
  console.log("Got an Error. Please try again!!!".red);
  console.error(error);
  process.exit();
}
