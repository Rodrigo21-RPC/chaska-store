import { spawn } from 'node:child_process';
const commands = [
  ['--watch', '--env-file-if-exists=.env', 'server/index.js'],
  ['node_modules/vite/bin/vite.js'],
];
const processes = commands.map(args => spawn(process.execPath, args, { stdio: 'inherit', windowsHide: true }));
let stopping = false;
function stop(code = 0) { if (stopping) return; stopping = true; processes.forEach(child => child.kill()); process.exitCode = code; }
processes.forEach(child => child.on('exit', code => stop(code ?? 0)));
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
