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
	await browser.close();
})();
