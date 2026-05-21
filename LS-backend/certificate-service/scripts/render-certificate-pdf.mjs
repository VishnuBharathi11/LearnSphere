import puppeteer from "puppeteer";

const [url, outputPath, orientation = "landscape"] = process.argv.slice(2);

if (!url || !outputPath) {
  console.error("Usage: node render-certificate-pdf.mjs <url> <outputPath> <landscape|portrait>");
  process.exit(1);
}

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"]
});

try {
  const page = await browser.newPage();
  await page.setViewport({
    width: orientation === "portrait" ? 1240 : 1754,
    height: orientation === "portrait" ? 1754 : 1240,
    deviceScaleFactor: 1
  });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 45000 });
  await page.emulateMediaType("screen");
  await page.pdf({
    path: outputPath,
    format: "A4",
    landscape: orientation !== "portrait",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" }
  });
} finally {
  await browser.close();
}
