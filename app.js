const axios = require("axios");
const cheerio = require("cheerio");
const colors = require("colors");
const puppeteer = require('puppeteer')
const fs = require("fs");
const {argv}  = require("yargs");
const {join} = require("path")

const contestCode = argv.contestCode ? argv.contestCode : process.argv[2];
const pdfTrue = argv.pdfTrue ? argv.pdfTrue : process.argv[3];

const dir = join(__dirname, "..", "Codeforces",contestCode);
const assetsDir = join(__dirname,"assets");
const baseUrl = "https://codeforces.com";

axios.defaults.baseURL = baseUrl;

createReqFiles()
getQuestions();

function createReqFiles() {
  createDir(join(__dirname, "..", "Codeforces"));
  createDir(dir);
  // if (!fs.existsSync(join(dir,'runall.sh'))) {
  //   fs.copyFile(join(assetsDir,"runall.sh"), join(dir,'runall.sh'), (err) => err ? handleError(err) : null);
  // }

  // if (!fs.existsSync(join(dir,'compare.sh'))) {
  //   fs.copyFile(join(assetsDir,"compare.sh"), join(dir,'compare.sh'), (err) => err ? handleError(err) : null);
  // }
}

async function getQuestions() {
  if (contestCode == null) {
    console.log("Please enter the contest code".red);
    return;
  }

  console.log("Fetching the data...".yellow);

  const problemsId = await getProblemsID();

  problemsId.forEach(id => {
    getProblemTestCase(id)
  });



  // #TODO Disable Pdf for exe files 
  if(pdfTrue=="true" || pdfTrue==1)
    getProblemStatement(problemsId);

}


function getProblemStatement(problemsId, id) {
  problemsId.forEach( (id) => {
    printPDF(baseUrl+"/contest/" + contestCode+"/problem/"+id, dir+"/"+id+"/"+id+".pdf", id);
  })
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
  axios
    .get("/contest/" + contestCode + "/problem/" + problemId)
    .then((res) => {
      const $ = cheerio.load(res.data);

      let test_cases = [];

      $(".sample-tests .input pre").each(function (i, elem) {
        test_cases[i] = { input: $(elem).text().trim() };
      });

      $(".sample-tests .output pre").each(function (i, elem) {
        test_cases[i] = { ...test_cases[i], output: $(elem).text().trim() + '\n' };
      });

      storeTestCases(problemId, test_cases);
    })
    .catch((err) => handleError());
}

async function storeTestCases(problemId, test_cases) {
  const problem_dir = join(dir,problemId);

  createDir(problem_dir)
  createDir(join(problem_dir, "input"))
  createDir(join(problem_dir, "output"))
  createDir(join(problem_dir, "codeOutput"))

  if (!fs.existsSync(join(problem_dir, "sol.cpp"))) {
    if(!fs.existsSync(join(__dirname,'template.cpp')))
      fs.copyFile(join(assetsDir,"template.cpp"), join(problem_dir, "sol.cpp"), (err) => err ? handleError(err) : null);
    else
      fs.copyFile(join(__dirname,'template.cpp'), join(problem_dir, "sol.cpp"), (err) => err ? handleError(err) : null);
  }
  
  test_cases.forEach((test_case, i) => {
    if(i==0) {
      createFile(join(problem_dir,"input.txt"),test_case.input);
      createFile(join(problem_dir,"output.txt"),test_case.output);
    }
    createFile(join(problem_dir,"input","input"+i+".txt"),test_case.input);
    createFile(join(problem_dir,"output","output"+i+".txt"),test_case.output);
  });
  
  console.log("Saved ".green + "TestCases "+problemId);

}

function createDir(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  } 
}

function createFile(fileName, test_case) {
  fs.writeFile(fileName, test_case, (err) => err ? handleError(err) : null);
}

async function printPDF(url, path, id) {

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: 'networkidle0'});
    await page.pdf({path:path});
   
    await browser.close();
    
    console.log("Downloaded ".green + "Problem "+id);

  }catch(err) {
    handleError(err);
  }

}

function handleError(error) {
  console.log("Got an Error. Please try again!!!".red);
  console.error(error)
  process.exit();
}
