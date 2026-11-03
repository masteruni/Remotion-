#!/usr/bin/env node
/**
 * Instagram link -> edited reel + thumbnail + caption.
 *
 *   npm run reel -- <instagram url>            prepare + render everything
 *   npm run reel -- <url> --prepare-only       download/transcribe/plan, then stop (edit job.json)
 *   npm run reel -- --slug <slug>              re-render after editing public/reels/<slug>/job.json
 *   npm run reel -- <url> --fresh              throw away edits and start over
 *
 * Outputs land in out/reels/<slug>/: reel.mp4, thumbnail.jpg, caption.txt
 */
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name) => {
	const i = args.indexOf(name);
	return i >= 0 ? args[i + 1] : undefined;
};
const url = args.find((a) => /^https?:\/\//.test(a));
const shortcode = url?.match(/instagram\.com\/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/)?.[1];
const slug = opt('--slug') ?? shortcode;

if (!url && !slug) {
	console.error('Usage: npm run reel -- <instagram url> [--prepare-only] [--fresh] [--model small]');
	process.exit(1);
}

const run = (cmd, argv) => execFileSync(cmd, argv, {stdio: 'inherit', cwd: ROOT});
const jobRel = `reels/${slug}/job.json`;
const jobPath = path.join(ROOT, 'public', jobRel);

if (url && (flag('--fresh') || !existsSync(jobPath) || flag('--prepare'))) {
	const py = ['-I', 'scripts/reel/prepare.py', url, ...(slug ? ['--slug', slug] : [])];
	if (flag('--fresh')) py.push('--fresh');
	py.push('--model', opt('--model') ?? 'small.en');
	run('python3', py);
}
if (!existsSync(jobPath)) {
	console.error(`No job at public/${jobRel}. Pass the Instagram URL to prepare it.`);
	process.exit(1);
}
writeFileSync(path.join(ROOT, 'public/reels/latest.json'), JSON.stringify({job: jobRel}) + '\n');
if (flag('--prepare-only')) {
	console.log(`\nPrepared. Edit public/${jobRel}, preview with "npm run dev" (Reels folder), then: npm run reel -- --slug ${slug}`);
	process.exit(0);
}

const outDir = path.join(ROOT, 'out/reels', slug);
mkdirSync(outDir, {recursive: true});
const props = JSON.stringify({job: jobRel});
const browser = existsSync('/opt/pw-browsers/chromium') ? ['--browser-executable=/opt/pw-browsers/chromium'] : [];

run('npx', ['remotion', 'render', 'Reel', path.join(outDir, 'reel.mp4'), `--props=${props}`, '--crf=18', '--concurrency=3', ...browser]);
run('npx', ['remotion', 'still', 'ReelThumbnail', path.join(outDir, 'thumbnail.png'), `--props=${props}`, ...browser]);
run('ffmpeg', ['-y', '-v', 'error', '-i', path.join(outDir, 'thumbnail.png'), '-q:v', '2', path.join(outDir, 'thumbnail.jpg')]);

const job = JSON.parse(readFileSync(jobPath, 'utf8'));
writeFileSync(path.join(outDir, 'caption.txt'), job.caption.trim() + '\n');

console.log(`\nDone -> out/reels/${slug}/`);
console.log('  reel.mp4  thumbnail.jpg  caption.txt\n');
console.log(job.caption);
