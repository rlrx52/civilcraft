import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tools = path.join(root, '.civilcraft-local');
const script = path.join(root, 'devshell', 'serve.mjs');
const stateFile = path.join(tools, 'server.json');
const git = path.join(tools, 'git', 'cmd', 'git.exe');
const url = 'http://127.0.0.1:8000/';
const env = { ...process.env, PATH: [path.dirname(process.execPath), path.join(tools, 'php'), path.dirname(git), process.env.PATH].join(path.delimiter) };
const popplerRoot = path.join(tools, 'poppler');
if (fs.existsSync(popplerRoot)) {
  for (const entry of fs.readdirSync(popplerRoot)) {
    if (entry.startsWith('poppler-')) env.PATH = path.join(popplerRoot, entry, 'Library', 'bin') + path.delimiter + env.PATH;
  }
}
process.chdir(root);

function serverProcess() {
  if (!fs.existsSync(stateFile)) return null;
  const saved = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  if (!Number.isSafeInteger(saved.pid) || saved.pid < 1) throw new Error('Invalid saved server PID.');
  const result = execFileSync('powershell.exe', ['-NoProfile', '-Command',
    `Get-CimInstance Win32_Process -Filter 'ProcessId=${saved.pid}' | Select-Object ExecutablePath,CommandLine | ConvertTo-Json -Compress`
  ], { encoding: 'utf8', windowsHide: true }).trim();
  if (!result) return null;
  const actual = JSON.parse(result);
  if (actual.ExecutablePath?.toLowerCase() !== process.execPath.toLowerCase() ||
      !actual.CommandLine?.includes(script)) {
    throw new Error('The saved PID belongs to another program. No process was changed.');
  }
  return saved;
}

function runGit(args) {
  const result = spawn(git, args, { cwd: root, env, stdio: 'inherit', windowsHide: true });
  return new Promise((resolve, reject) => {
    result.on('error', reject);
    result.on('exit', code => code === 0 ? resolve() : reject(new Error(`Git exited with code ${code}.`)));
  });
}

async function portIsFree() {
  return new Promise(resolve => {
    const probe = net.createServer();
    probe.once('error', () => resolve(false));
    probe.listen(8000, '127.0.0.1', () => probe.close(() => resolve(true)));
  });
}

try {
  const command = process.argv[2];
  if (command === 'start') {
    if (!serverProcess()) {
      if (!await portIsFree()) throw new Error('Port 8000 is already in use. Stop the existing server first.');
      const out = fs.openSync(path.join(tools, 'server.stdout.log'), 'w');
      const err = fs.openSync(path.join(tools, 'server.stderr.log'), 'w');
      const child = spawn(process.execPath, [script, '--host', '127.0.0.1', '--port', '8000'], {
        cwd: root, env, detached: true, windowsHide: true, stdio: ['ignore', out, err]
      });
      await new Promise((resolve, reject) => { child.once('spawn', resolve); child.once('error', reject); });
      fs.writeFileSync(stateFile, JSON.stringify({ pid: child.pid }));
      fs.closeSync(out); fs.closeSync(err); child.unref();
    }
    let ready = false;
    for (let attempt = 0; attempt < 20; attempt++) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
        if (response.ok && (await response.text()).includes('CivilCraft')) { ready = true; break; }
      } catch {}
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    if (!ready) throw new Error('The development server did not start. Check .civilcraft-local/server.stderr.log.');
    if (!process.argv.includes('--no-browser')) {
      const browser = spawn('rundll32.exe', ['url.dll,FileProtocolHandler', url], { detached: true, windowsHide: true, stdio: 'ignore' });
      browser.unref();
    }
    console.log(`Your local CivilCraft development copy is running at ${url}`);
  } else if (command === 'stop') {
    const saved = serverProcess();
    if (saved) { process.kill(saved.pid); console.log('Stopped your local CivilCraft development server.'); }
    else console.log('The development server is already stopped.');
  } else if (command === 'updates') {
    await runGit(['fetch', 'upstream', '--tags']);
    console.log('\nCurrent branch:'); await runGit(['branch', '--show-current']);
    console.log('\nLatest upstream tags:'); await runGit(['tag', '--list', '--sort=-creatordate']);
    console.log('\nUpstream commits not yet in your custom branch:'); await runGit(['log', '--oneline', 'custom..upstream/main']);
    console.log('\nFetched updates only. Your checked-out files and custom branch were not changed.');
    console.log('Follow local-setup/README.md to merge an update on a review branch.');
  } else throw new Error('Use start, stop or updates.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
