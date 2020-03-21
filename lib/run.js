const Octokit = require('@octokit/rest').Octokit;
const eslint = require('eslint');

const {GITHUB_SHA, GITHUB_EVENT_PATH, GITHUB_TOKEN, GITHUB_WORKSPACE} = process.env

const {repository: {login: owner}, name: repo, number} = require(GITHUB_EVENT_PATH);

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
    const {results, errorCount} = report;
    const formatter = engine.getFormatter("unix");
    const formattedReport = formatter(results);

    return {report: formattedReport, errorCount }
}

function createComment(owner, repo, issueNumber, report) {

    const octokit = new Octokit({
        auth: GITHUB_TOKEN,
        baseUrl: 'https://api.github.com',
    });

    return octokit.issues.createComment({
        owner: 'florianschmidt1994',
        repo: 'repo-for-testing-linting',
        issue_number: number,
        body: `**Report from ESLint**\n\`\`\`\n${report}\n\`\`\``,
    });
}


const {report, errorCount} = generateReport();
createComment(owner, repo, number, report, GITHUB_TOKEN)
    .then(() => {
      if (errorCount > 0) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    })
    .catch(err => {
        console.log(err);
        process.exit(1)
    });