const puppeteer = require('puppeteer');
const http = require("http");
const fs = require("fs");
const path = require("path");
const yargs = require("yargs");

const PORT = 3000;

const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

function contentType(url) {
    const extname = path.extname(url);
    switch (extname) {
        case '.html':
            return 'text/html';
        case '.js':
            return 'text/javascript';
        case '.css':
            return 'text/css';
        case '.json':
            return 'application/json';
        case '.png':
            return 'image/png';
        case '.jpg':
        case '.jpeg':
            return 'image/jpg';
        case '.wav':
            return 'audio/wav';
        default:
            return 'text/plain';
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function runHttpServer() {
    const server = http.createServer((req, res) => {
        const filePath = __dirname + "/content" + new URL("http://127.0.0.1:3000" + req.url).pathname;
        console.log(filePath);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end("404: File not found");
            } else {
                res.writeHead(200, {'Content-Type': contentType(filePath)});
                res.end(data);
            }
        });
    }).listen(PORT);
}

function parseArgs() {
    let {month, year, output} = yargs(process.argv.slice(2))
        .usage("Usage: $0 --month [month] --year [year]")
        .demandOption(["month", "year"])
        .default("output", "result.pdf")
        .argv;
    if (typeof month === 'string') {
        const idx = MONTH_NAMES.findIndex(monthName => monthName.toLocaleUpperCase().startsWith(month.toLocaleUpperCase()));
        if (idx < 0) {
            throw new Error(`Unknown month: ${month}`);
        }
        month = idx;
    }
    if (MONTH_NAMES[month] === undefined) {
        throw new Error(`Unknown month: ${month}`);
    }
    if (isNaN(year)) {
        throw new Error(`Bad year: ${year}`);
    }
    return {month, year};
}

async function main() {
    const {month, year, output} = parseArgs();

    console.log("[INFO] Running http server");
    runHttpServer();

    console.log("[INFO] Launching browser");
    const browser = await puppeteer.launch({ headless: "new" });
    console.log("[INFO] Opening new page");
    const page = await browser.newPage();

    const website_url = `http://127.0.0.1:${PORT}/calendar.html?month=${month}&year=${year}&hot_reload=false`;
    console.log("[INFO] Loading content");
    await page.goto(website_url, {waitUntil: "networkidle0"});
    await page.emulateMediaType('screen');
    console.log("[INFO] Exporting to PDF");
    const pdf = await page.pdf({
        path: output,
        format: "A4",
        landscape: true,
    });
    await browser.close();
    console.log("[INFO] Done");
    process.exit();
}

main()