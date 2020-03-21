const Octokit = require('@octokit/rest').Octokit;
const eslint = require('eslint');

const octokit = new Octokit({
  auth: 'e4d279f922689e427202d21df797a658e52c12c7',
  baseUrl: 'https://api.github.com',
});


const {GITHUB_SHA, GITHUB_EVENT_PATH, GITHUB_TOKEN, GITHUB_WORKSPACE} = process.env

const { repository: {login: owner}, name: repo} = require(GITHUB_EVENT_PATH);

console.log(JSON.stringify(require(GITHUB_EVENT_PATH)));

function humanSeverity(severity) {
  return ['', 'warning', 'error'][severity]
}

function generateReport() {
  const CLIEngine = eslint.CLIEngine;
  const engine = new CLIEngine({
    extensions: ['.js', '.jsx'],
    ignorePath: '.gitignore'
  });
  const report = engine.executeOnFiles(['src/**/*.js*']);
  const {results} = report;
  const formatter = engine.getFormatter("unix");
  const formattedReport = formatter(results);

  return formattedReport;
}

function createComment(owner, repo, issueNumber, report) {
  return octokit.issues.createComment({
    owner: 'florianschmidt1994',
    repo: 'repo-for-testing-linting',
    issue_number: 1,
    body: `\`\`\`\n${report}\n\`\`\``,
  });
}
