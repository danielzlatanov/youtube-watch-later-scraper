# youtube-watch-later-scraper
scrape your watch later playlist in seconds for easy sorting and organization

## 📖 Quick Guide

1. **Clone the Repo**
   ```bash
   git clone https://github.com/danielzlatanov/youtube-watch-later-scraper.git
   
   cd youtube-watch-later-scraper

2. **Install Dependencies**
   ```bash
   npm install

3. **Start the Script**
   ```bash
   npm start

  This will launch Puppeteer in headless
  mode and navigate to YouTube.

4. **YouTube Manual Login**

Once the terminal shows the message **'Log in manually in the browser, then press Enter in the terminal'**, go to the Chromium browser (installed by Puppeteer) for testing, log into your YouTube account, and return to the terminal.

Press **Enter** to continue the automation script.

5. **Progress Tracking**

You can track the progress in the terminal as the script scrolls through your YouTube playlist. This is optional, but the terminal log will show updates, and it’s not really necessary to watch the loading process on YouTube.

6. **Final Output**

After the progress bar finishes, the script will log the total extracted videos and the location of the output file.

The **.xlsx** file will be saved in the output folder in the root directory as **scrapeWatchLater_sorted_{date}_{time}.xlsx**.

7. **View the File**

Open the sorted & styled Excel file with Google Sheets or Microsoft Excel and enjoy!
