const core = require('@actions/core');
const github = require('@actions/github');

// Constants for this particular repo.
const botUser = 'teto-bot';
const botRepo = 'sagebind/teto-bot';

async function main() {
    try {
        // Extract command
        const match = github.context.payload.comment.body.match(`^@${botUser}(?:\\s+(\\S+))?`);

        if (!match) {
            return;
        }

        const commandName = match[1];
        const token = core.getInput('token');
        const octokit = github.getOctokit(token);

        let client_payload = {
            repository: `${github.context.repo.owner}/${github.context.repo.repo}`,
            repository_owner: github.context.repo.owner,
            comment: github.context.payload.comment,
            issue: github.context.payload.issue,
        };

        // If this comment is on a pull request, fetch additional info about the pull request.
        if (client_payload.issue.pull_request) {
            client_payload.pull_request = (await octokit.pulls.get({
                repo: github.context.repo.repo,
                owner: github.context.repo.owner,
                pull_number: github.context.payload.issue.number,
            })).data;
        }

        const [owner, repo] = botRepo.split('/');

        await octokit.repos.createDispatchEvent({
            owner: owner,
            repo: repo,
            event_type: commandName + '-command',
            client_payload,
        });

        // Confirm success by reacting to the comment.
        await octokit.reactions.createForIssueComment({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            comment_id: github.context.payload.comment.id,
            content: '+1',
        });
    } catch (error) {
        core.setFailed(error.message);
    }
}

main();
