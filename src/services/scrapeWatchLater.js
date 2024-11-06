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
	const sortedVideos = videos
		.map(video => ({
			...video,
			durationInSeconds: durationToSeconds(video.duration),
		}))
		.filter(video => !isNaN(video.durationInSeconds))
		.sort((a, b) => a.durationInSeconds - b.durationInSeconds)
		.map(video => ({
			title: video.title,
			duration: secondsToDuration(video.durationInSeconds),
			url: video.url,
		}));

	progressBar.update(95);

	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet('Videos');

	const headerRow = worksheet.addRow(['Title', 'Duration']);
	headerRow.getCell(1).font = { bold: true, size: 13, color: { argb: 'FFFFFF' } };
	headerRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
	headerRow.getCell(1).fill = {
		type: 'pattern',
		pattern: 'solid',
		fgColor: { argb: '008000' },
	};
	headerRow.getCell(2).font = { bold: true, size: 13, color: { argb: 'FFFFFF' } };
	headerRow.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
	headerRow.getCell(2).fill = {
		type: 'pattern',
		pattern: 'solid',
		fgColor: { argb: '008000' },
	};

	sortedVideos.forEach(video => {
		const row = worksheet.addRow([video.title, video.duration]);
		row.getCell(1).font = { bold: false };
		row.getCell(2).font = { bold: false };
		row.getCell(1).value = { text: video.title, hyperlink: `https://www.youtube.com${video.url}` };
	});

	worksheet.columns.forEach(column => {
		let maxLength = 0;
		column.eachCell({ includeEmpty: false }, cell => {
			let cellLength =
				typeof cell.value === 'object' && cell.value.text
					? cell.value.text.length
					: cell.value
					? cell.value.toString().length
					: 10;
			if (cellLength > maxLength) maxLength = cellLength;
		});
		column.width = maxLength + 2;
	});
	await browser.close();
})();
