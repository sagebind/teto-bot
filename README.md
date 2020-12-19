# Teto

A mad scientist attempt to create a centralized ChatOps bot on GitHub powered by GitHub Actions itself. Teto is a bot (manifested as [@teto-bot](https://github.com/teto-bot)) that supports running commands just by mentioning it by name in a pull request or issue under enabled repos.

Teto is not currently designed for general use and is currently just an experiment for personal use on my own repositories.

## How does it work?

Teto is both an Action _and_ a GitHub repository housing common workflows. When the Teto Action is invoked, it "phones home" by submitting a [`repository_dispatch`](https://docs.github.com/en/free-pro-team@latest/actions/reference/events-that-trigger-workflows#repository_dispatch) event to _this repo_, regardless of the repo it was called in. If the action is a valid command, it will trigger a workflow to be run in this repository instead of the originating repository. The webhook payload includes the originating repository information, so the workflow can checkout the originating repository if needed to accomplish the requested task.

To enable Teto on a repository, you must do the following:

1. Add Teto as a collaborator
2. Get a Personal Access Token from Teto and add it to your secrets as `TETO_PAT`
3. Add a GitHub Actions workflow that invokes Teto

The Teto workflow is basically boilerplate that looks like this:

```yaml
name: teto
on:
  issue_comment:
    types: [created]

jobs:
  teto:
    runs-on: ubuntu-latest
    steps:
      - uses: sagebind/teto-bot@master
        with:
          token: ${{ secrets.TETO_PAT }}
```

Once added to the default branch, the repository will suddenly support all commands Teto supports as configured in this repository.

## Why?

Actions that need to commit to a repository can be tricky. One reason why you might want to use a bot/machine account to do so is that such commits will then trigger normal CI workflows, as the default GitHub Actions token does not (for decent reasons). In addition, to be able to commit to pull requests from a fork (when the author allows it) you must be a maintainer of the base repository. Adding a bot account as a collaborator and then using it to perform automated commits handles this.

GitHub also does not support any sort of proper "template" repository system right now for workflows, so complicated workflows that can't be consolidated into a single action must be copy-pasted into every repo, which can become a maintenance problem if you need to make changes to the workflow later. With Teto's setup, common workflows are all stored in a centralized repo that only has to be updated once.

Also, this was a fun experiment to see if it was possible to (ab)use GitHub Actions to take it farther than they may have intended.

## Future work

Teto should be generalized so that you can fork it and use it with a different GitHub bot account. It isn't a good idea to grant repository write permissions to a bot account you don't trust or control.

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for details.
