# Your CivilCraft setup

Prepared on 13 November 2026 for GitHub account `rlrx52`.

## Open the two copies

- **Official application:** open CadCraft Studio from the Windows Start menu, then select CivilCraft. The official installer checks for published Studio updates and offers to install them.
- **Development copy:** open the `CivilCraft Development` desktop shortcut, or double-click `Start Custom CivilCraft.cmd` in the repository root. It starts a hidden local server and opens http://127.0.0.1:8000/. Reload the page after editing JavaScript or CSS. PHP renders interface template edits on each page load.
- **Stop development:** double-click `Stop Custom CivilCraft.cmd`. This stops only the saved CivilCraft server process.

The source folder is `C:\Users\robha\Documents\ChatGPT\CivilCraft`.
The development server listens on this computer only. Its logs are in `.civilcraft-local/`.
The official application and the development browser use separate settings/storage. Open a copy of a project when comparing versions.
Keep design project files and client data in a separate documents folder, outside this public source repository.

## Source and tools

- `origin`: https://github.com/rlrx52/civilcraft.git (your public fork).
- `upstream`: https://github.com/getcadcraft/civilcraft.git (the original project).
- `main`: clean upstream branch. Keep your changes off it.
- `custom`: your integrated development version, initially based on upstream commit `cdf99cbd` (the 0.9 application with later documentation/CI changes).
- `feature/<name>`: one new feature under development, branched from `custom`.

Portable Node.js 24.22.3 (including npm), PHP 8.4.27, Git 2.56.1 and Poppler 26.09.0 for PDF verification are stored in `.civilcraft-local/`; their download checksums were verified. Poppler is the Windows package from oschwartz10612/poppler-windows, used only as an external test utility. There are no system-wide PATH or PowerShell policy changes.
`.gitignore` and this checkout's `.git/info/exclude` exclude `.civilcraft-local/` and downloaded `devshell/vendor/` libraries. These tools and caches are local and are not backed up by Git. A new computer needs its own development tools.

For commands below, first open Command Prompt in this folder and load the project tools:

```bat
call local-setup\Environment.cmd
```

This changes only that Command Prompt session's PATH. The launchers use Node.js and do not require enabling PowerShell scripts.

## Add a feature

```powershell
git switch custom
git switch -c feature/my-feature
# Make and inspect your changes, then run relevant tests.
git add <specific-files>
git commit -m "Describe the new behavior"
git push -u origin feature/my-feature
```

Review and merge the feature into `custom`, either locally or through a pull request **to your own fork's custom branch**. Check the target carefully: GitHub may suggest the original repository by default. Keep the app's own reusable logic in separate modules where practical. Assess the add-on interfaces before modifying core code. Use the original contribution guide for anything you intend to offer upstream.

## Receive upstream updates

Double-click `Check CivilCraft Updates.cmd` to fetch tags and show new commits. This does not merge changes into your code.
To review an update, commit any outstanding work first and stop the development server:

```powershell
git fetch upstream --tags
git switch main
git merge --ff-only upstream/main
git push origin main
git switch custom
git switch -c update/upstream-YYYY-MM-DD
git merge upstream/main
# Resolve any conflicts, test, then check your normal workflows.
```

For a release-based update, replace `upstream/main` in the last command with the exact release tag shown by `git tag --list`.
After validation:

```powershell
git switch custom
git merge --ff-only update/upstream-YYYY-MM-DD
git push origin custom
```

If a merge conflicts, stop and resolve the affected files. To abandon an in-progress merge before making other edits, use `git merge --abort`. Avoid force pushes, `reset --hard`, and automatic merges into `custom`.
Future official installer updates do not merge source changes into this development copy.

## Tests and packaging

```powershell
npm.cmd test -- --only test-civilcraft.mjs --no-python
npm.cmd test
node devshell/edition.mjs --version 0.9 --zip
```

The upstream test suite includes Linux-oriented paths, symlinks and external test tools. Some checks need a Linux/WSL environment or additional tools; do not equate skipped checks with passes. The setup validation results are recorded in `local-setup/VALIDATION.md`.
For a custom release, choose your own version and name, keep LICENSE/NOTICE and follow TRADEMARKS.md before distributing it. Build your custom edition separately from the installed official application.

Official references: [building](https://github.com/getcadcraft/civilcraft/blob/main/BUILDING.md), [contributing](https://github.com/getcadcraft/civilcraft/blob/main/CONTRIBUTING.md), [downloads](https://getcadcraft.com/download).
