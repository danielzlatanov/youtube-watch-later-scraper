const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const cliProgress = require('cli-progress');

puppeteer.use(StealthPlugin());

function durationToSeconds(duration) {
	const parts = duration.split(':').map(Number);
	return parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];
}

function secondsToDuration(seconds) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;
	return [hours, minutes, secs].map(val => String(val).padStart(2, '0')).join(':');
}

(async () => {
	const browser = await puppeteer.launch({
		headless: false,
		// slowMo: 200,
		args: [
			'--start-maximized',
			'--window-size=1920,1080',
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			'--disable-gpu',
			'--no-first-run',
		],
		defaultViewport: null,
	});

	const [initPage] = await browser.pages();
	await initPage.goto('https://www.youtube.com', { waitUntil: 'networkidle2' });

	console.log('AUTOMATION PAUSED: Log in manually in the browser, then press Enter in the terminal.');

	await new Promise(resolve => process.stdin.once('data', resolve));

	await initPage.goto('https://www.youtube.com/playlist?list=WL', { waitUntil: 'networkidle2' });

	const progressBar = new cliProgress.SingleBar(
		{
			format: ' {bar} {percentage}% | ETA: {eta}s ',
		},
		cliProgress.Presets.shades_classic
	);
	progressBar.start(100, 10);

	let previousHeight;
	let scrollProgress = 10;

	do {
		previousHeight = await initPage.evaluate('document.documentElement.scrollHeight');
		await initPage.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)');
		await new Promise(resolve => setTimeout(resolve, 2000));

		scrollProgress = Math.min(scrollProgress + 5, 80);
		progressBar.update(scrollProgress);
	} while (previousHeight !== (await initPage.evaluate('document.documentElement.scrollHeight')));

	progressBar.update(90);

	const videos = await initPage.evaluate(() => {
		const videoElements = Array.from(document.querySelectorAll('ytd-playlist-video-renderer'));
		return videoElements.map(video => {
			const titleElement = video.querySelector('#video-title');
			const durationElement = video.querySelector('.badge-shape-wiz__text');

			return {
				title: titleElement ? titleElement.textContent.trim() : 'Unknown Title',
				duration: durationElement ? durationElement.textContent.trim() : '00:00',
				url: titleElement ? titleElement.getAttribute('href') : '',
			};
		});
	});
	await browser.close();
})();
