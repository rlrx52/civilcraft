# Setup validation — 13 November 2026

## Installed application

- Official Windows installer: CadCraft Studio 0.9.0, downloaded from the vendor's CDN.
- SHA-256: `041a46fd298a0c374543f871e7a14a0e174dc46307d294c1d0f82c72b615f4c2`, matched the vendor's published checksum before execution.
- Installer exited with code 0. Windows uninstall registration reports version 0.9.0.
- Install folder: `C:\Users\robha\AppData\Local\CadCraft Studio`.
- Desktop and Start menu shortcuts were created by the installer.
- Installed `shell.json` has the vendor update endpoint, edition `installer`, and automatic update checks enabled.
- Launched Studio with `--app=civilcraft` and visually verified that the CivilCraft 0.9 desktop interface renders.

## Source and development

- Full Git history and release tags cloned. Baseline: `cdf99cbd97096735561353dd0654c662e9e0e24c`.
- Fork created: https://github.com/rlrx52/civilcraft.
- `main` tracks `upstream/main`; `custom` tracks `origin/custom`.
- Project-local Node.js 24.22.3, PHP 8.4.27, Git 2.56.1 and Poppler 26.09.0 verified against published SHA-256 download digests.
- All 339 vendored library files downloaded using the project's checksum-verifying fetcher.
- Local server returns HTTP 200 with PHP rendering, bound to `127.0.0.1:8000`.
- The actual Windows start and stop launchers were exercised, including starting an already-running server.
- The update checker fetched upstream tags without changing the checked-out files or branch.
- A normal Windows Command Prompt can load the local Node, PHP, Git and Poppler tools using `local-setup\Environment.cmd`.
- Development browser imported `sample-site.csv`: **276 points and a 546-triangle surface**.
- A separate `CivilCraft Development` desktop shortcut opens the local source version.

## Core engineering tests

The upstream runner built its test mirror with:

```text
node devshell/test.mjs --only test-civilcraft.mjs --offline --no-python
```

The first run reported 302 passes and one failure because `pdftotext` was absent. After installing the external Poppler test utility, the same existing core test was repeated in the generated mirror with the runner's `CC_DEVSHELL=1` and warning-suppression environment:

```text
node .cc-test/bin/test-civilcraft.mjs
303 passed, 0 failed
```

Coverage includes units/stations, point files, TINs, contours, breaklines, alignments, profiles, grading and volumes, corridors, pipe networks, LandXML round trips, DXF/PDF, project undo and point clipboard operations.

Optional independent lxml/ezdxf/DWG reader checks were skipped because their external environments were not installed. The full set of 83 test files was not run; this was setup validation, not validation of every engineering feature. No CivilCraft application source files were changed.

Logs are local in `.civilcraft-local/core-test.log`, `core-test-with-poppler.log`, `fetch-vendor.log` and `server.*.log`.
