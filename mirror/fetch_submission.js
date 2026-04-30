
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const targetUrl = process.argv[2];

if (!targetUrl || !targetUrl.includes('/submission/')) {
    console.error('Error: Invalid Submission URL');
    process.exit(1);
}

(async () => {
    let browser;
    try {
        console.error(`🚀 Ultra-Stealth Launch: ${targetUrl}`);
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--window-position=0,0',
                '--ignore-certifcate-errors',
                '--ignore-certifcate-errors-spki-list',
                '--user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"'
            ]
        });

        const page = await browser.newPage();
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
        });

        console.error(`🔗 Navigating...`);
        // Use domcontentloaded for speed, then wait manually
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

        console.error(`⏳ Waiting for content (40s max)...`);

        // Custom wait loop looking for EITHER the code OR a known error/block
        let found = false;
        for (let i = 0; i < 40; i++) {
            const result = await page.evaluate(() => {
                const sourceEl = document.querySelector('#program-source-text') || document.querySelector('pre code');
                if (sourceEl) {
                    const htmlContent = document.body.innerHTML;
                    const isAccepted = htmlContent.includes('verdict-accepted') || htmlContent.includes('>Accepted<') || htmlContent.includes('>OK<');

                    if (!isAccepted) {
                        return { error: 'Not Accepted Verdict' };
                    }

                    const authorEl = document.querySelector('.main-menu-item a[href^="/profile/"]') || { textContent: 'unknown' };
                    let language = 'unknown';
                    const cells = Array.from(document.querySelectorAll('td'));
                    for (let j = 0; j < cells.length; j++) {
                        if (cells[j].textContent.includes('Language:')) {
                            language = cells[j + 1]?.textContent?.trim() || 'unknown';
                            break;
                        }
                    }
                    return { code: sourceEl.textContent, author: authorEl.textContent.trim(), language };
                }
                if (document.body.textContent.includes('Just a moment')) return 'block';
                return null;
            });

            if (result === 'block') {
                console.error(`⚠️ Cloudflare block detected. Waiting longer... (${i})`);
            } else if (result && result.error) {
                console.error(`❌ Evaluation Error: ${result.error}`);
                found = false;
                break; // Exit loop immediately, don't hang for 40s
            } else if (result && result.code) {
                console.log(JSON.stringify(result));
                console.error(`✅ Success! (${result.code.length} chars)`);
                found = true;
                break;
            }
            await new Promise(r => setTimeout(r, 1000));
        }

        if (!found) {
            console.error(`❌ Timeout or Block could not be bypassed.`);
            process.exit(1);
        }
    } catch (error) {
        console.error(`❌ Error:`, error.message);
        process.exit(1);
    } finally {
        if (browser) await browser.close();
    }
})();
