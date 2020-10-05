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
 **Run `node app.js contest_code_of_codeforces` to download sample test cases & `node run.js contest_code_of_codeforces problem_code` to check sample test-cases.**
- Get the contest number of codeforces of which you want to download sample test case. Contest number is in the url. ~~https://codeforces.com/contest/~~ **1420**
- Open the terminal in CodeforcesBOT_CLI.
- Execute *node app.js contest_code_of_codeforces* in the terminal. app.js take contest code as argument. Example `node app.js 1420` or `node app.js --contestCode 1420`.
- Above command will create a folder Codeforces in ../CodeforcesBOT_CLI - i.e. 1 folder back to current folder(CodeforcesBOT_CLI). Codeforces will consist of contest code dir that will have the problems dir with sample testcases and a cpp file for solution.
- You can write your solution in sol.cpp file of problem dir.
- To check for sample cases, execute *node run.js contest_code_of_codeforces problem_code*. run.js take contest code and problem id as arguments. Example `node run.js 1420 A` to check the sample test cases to your sol.cpp of problem A of contest code 1420.

## Config File
There is conifg.json in which you can set compiler and std of c++ you use.
There is a option to openFileInVsCode. If it is set to true it opens all the problems' solution file of contest to VsCode with cursor
at specified line in templateLineNo. 

## Template

Predefined template, i.e, template.cpp is provide in assests folder that is default code for each problem cpp file. You can save your own templae in template.cpp.

## Additional Features

You can also download pdf format of problems by providing additional arguments pdfTrue to app.js. Example `node app.js --contestCode 1420 --pdfTrue`. <br>
**But this need puppeteer library. You need to install it by running `npm i puppeteer --save`.** After installing the puppeteer uncomment the required line of puppeteer in app.js file.
