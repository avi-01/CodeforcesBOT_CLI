# CodeforcesBOT_CLI

### CodeForcesBot features:-<br>
- Download all the sample test cases of codeforces contest problem and add them to its respective directory.
- Add a sol.cpp to each problem with a predifend template.
- You can run all the sample test cases of a problem on your code with one command.

## Requirements
This application is coded in js language. You need node.js to run the code. <br>
If you do not have node.js in your system, you can install it from [Node.js](https://nodejs.org/en/).

## How to install
- Clone the repo to your system.
- Open terminal inside the cloned folder (CodeforcesBOT_CLI) and execute `npm i` (it will install all the dependencies)
- You are ready to download contest sample test case
### How to download sample test cases of contest
- Get the contest number of codeforces of which you want to download sample test case. Contest number is in the url. ~~https://codeforces.com/contest/~~ **1420**
- Open the terminal in CodeforcesBOT_CLI.
- Execute *node app.js contest_code_of_codeforces* in the terminal. app.js take contest code as argument. Example `node app.js 1420` or `node app.js --contestCode 1420`.
- Above command will create a folder Codeforces in ../CodeforcesBOT_CLI - i.e. 1 folder back to current foleder(CodeforcesBOT_CLI). Codeforces will conist of contest code dir that will have the problems dir with sample testcases and a sol.cpp file.
- You can write your solution in sol.cpp file of problem dir.
- To check for sample cases, execute *node run.js contest_code_of_codeforces problem_code*. run.js take contest code and problem id as arguments. Example `node run.js 1420 A` to check the sample test cases to your sol.cpp of problem A of contest code 1420.

## Additional Features

You can also download pdf format of problems by providing additional arguments pdfTrue to app.js. Example `node app.js --contestCode 1420 --pdfTrue`. <br>
**But this need puppeteer library. You need to install it by running `npm i puppeteer --save`.**
