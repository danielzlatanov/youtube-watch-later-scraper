const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const cliProgress = require('cli-progress');

puppeteer.use(StealthPlugin());

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
