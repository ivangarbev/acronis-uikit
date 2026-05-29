# Acronis UI Component Library Contributing Guide

We appreciate your contributions to Acronis UI Component Library.
Before submitting your contribution, please make sure to take a moment to read through the following guidelines.

## Forms of contribution

We welcome contributions in any form, including but not limited to the following:

* Problem suggestions
* Improve documentation
* Provide examples
* Improve testing
* Improve components
* Submit PR
* Participate in discussions
* Share project

## Issue Reporting

You can file a ticket for the bug/issue you found through [Issues](https://github.com/acronis/shadcn-uikit/issues) under project **UI component library**.
A clear reproduce steps will be very helpful to identify the root cause.
For the complicated scenario, you can also create an example in the [Sandbox](https://github.com/acronis/shadcn-uikit/sandbox/index.vue), or provide the example code in the ticket.

## Pull Request for Feature request/Bug Fixing/Improvements

Pull requests are welcomed for bug fixing/improvement in Acronis UI Component Library.
You can find a lot of useful information (e.g. "Directory structure" and "Setup and configuration") about the Acronis UI Component Library in the [README.md](Link to setup).
General [CI Git Workflow](Link to git docs) need to be followed when you prepare a pull request.
Meanwhile, below a checklist for the items need to do before raised a pull request,
and you can find the details for each point in the remaining part of this document:

1. Fork [This repo](https://github.com/acronis/shadcn-uikit)
2. Enter the local project root directory and use ```pnpm i``` to install dependencies.
3. Use ```pnpm run docs:dev``` to start the project and view the document.
4. Please pull the latest code before submitting to avoid file conflicts.
5. Commit your changes with a clear commit message, please abide by it at the same time. [Commit Standard](https://acronis.github.io/ui-component-library/guide/commitlint.html)。
6. Ensure the code follows [Style Guide for Front-end development](Link to styleguide).
7. Update unit test case
8. Update visual regression test case (if applicable)
9. Update performance test case (if applicable)
10. Update component documentation to:
   - Include the description of the feature's API
   - Provide an example of the feature if needed
11. Update component types for TypeScript support
12. Run the test to ensure all lint/unit/regression/performance tests pass
13. Submit a Pull Request。

### Pull Request

- Pull request should give details on what has been changed and why.
- Pull request should be small and focused on a single change. A pull request with more than 250 lines of code tend to tkake more than 1 hour to review.
- The title should be self-explanatory, describing what the pull request does.
- The description should provide a clear explanation of the changes made and why they were made.

### Commit types

The following is a list of commit types:

- feat: A new feature or functionality
- fix: A bug fix
- docs: Documentation only changes
- style: Code formatting or component style changes
- refactor: Code changes that neither fixes a bug nor adds a feature.
- perf: Improve performance
- test: Add missing or correct existing tests
- build: Changes that affect the build system or external dependencies;
- ci: Changes to our CI configuration files and scripts
- chore: Other commits that don’t modify src or test files;
- revert: Revert to a previous commit.

### Testing source code

#### Unit tests

[Vitest](https://vitest.dev/) and [Vue-test-utils](https://test-utils.vuejs.org/) are used for the unit testing.
The spec files must be located at the `src` folder.

#### Visual regression tests

You can find more information about visual regression tests in the [Visual regression tests section](https://acronis.github.io/ui-component-library/guide/testing.html#visual-regression-testing-with-cypress)

#### Performance tests

You can find more information about performance tests in the [Performance tests section](https://acronis.github.io/ui-component-library/guide/testing.html#performance-tests)

### Component documentation

The documentation for each component is located at [`apps/docs`](https://github.com/acronis/shadcn-uikit/tree/main/apps/docs) using Markdown/MDX format.
The implementation examples are located at [`apps/demos`](https://github.com/acronis/shadcn-uikit/tree/main/apps/demos).
For internal documentation we use Vitepress, you can find more information about Vitepress in the [Vitepress documentation](https://vitepress.dev/).

Each document consists of highlights of the API(props, slots, events) with examples and complete details of these components.
If the change in PR including the new API or API updates, you will need to update the API table at the end of the document.
Meanwhile, it will be convenient for QA to check if an example of the function is provided.

### Component types for TypeScript support

As Acronis UI Component Library is being used in many TypeScript projects, when there is new API or API updates in the pull request,
we will also need to update the declaration file for the UI Component Library.
The files located at `types` folder. You can find more information about TypeScript declaration file at [Link](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html).

### Bump Version & Update Changelog

We use [changesets](https://github.com/changesets/changesets) to manage versions
and changelogs. **Every PR that changes the published UI library
(`@acronis-platform/shadcn-uikit`) must include a changeset**, otherwise the
release PR won't know what to bump.

From the repo root:

```bash
pnpm changeset
```

Answer the prompts (patch / minor / major + a one-line summary). A new
markdown file is written under `.changeset/`. Commit it as part of your PR.

You don't need a changeset for changes scoped to the apps (`apps/demo`,
`apps/demos`, `apps/docs`) — they are private and listed as ignored in
`.changeset/config.json`.

On merge to `main`, the `Release` workflow opens (or updates) a single
"Version Packages" PR aggregating all pending changesets. Merging that PR
publishes the bumped package to both npm and GitHub Packages and creates the
corresponding GitHub Release.

Commit messages still follow [Conventional Commits](https://www.conventionalcommits.org/)
so the existing commitlint hook keeps working, but the **release version is
driven by the changeset bump type, not the commit prefix**.

## License

By contributing your code to the repository, you agree to license your contribution under the [MIT license](https://github.com/acronis/shadcn-uikit/blob/main/LICENSE).
