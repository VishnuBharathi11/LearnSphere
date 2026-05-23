import puppeteer from "puppeteer";

const [url, outputPath, orientation = "landscape"] = process.argv.slice(2);

if (!url || !outputPath) {
  console.error("Usage: node render-certificate-pdf.mjs <url> <outputPath> <landscape|portrait>");
  process.exit(1);
}

console.log(`[PDF Renderer] Starting PDF generation for: ${url}`);
console.log(`[PDF Renderer] Output path: ${outputPath}`);

let browser;

try {
  // Launch browser with optimized and stable settings for certificate rendering
  browser = await puppeteer.launch({
    headless: true,
    dumpio: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--font-render-hinting=none",
      "--disable-gpu"
    ]
  });

  console.log(`[PDF Renderer] Browser launched successfully`);

  const page = await browser.newPage();
  
  // Set realistic viewport for certificate rendering
  await page.setViewport({
    width: orientation === "portrait" ? 1240 : 1754,
    height: orientation === "portrait" ? 1754 : 1240,
    deviceScaleFactor: 1
  });

  console.log(`[PDF Renderer] Viewport set to ${orientation} orientation`);

  // Navigate to URL with optimized wait condition (reduced from 45s to 20s)
  try {
    await page.goto(url, { 
      waitUntil: "networkidle2", // Changed from "networkidle0" to be faster
      timeout: 20000 // Reduced from 45s to 20s for faster execution
    });
    console.log(`[PDF Renderer] Page loaded successfully from ${url}`);
  } catch (navigationError) {
    console.error(`[PDF Renderer] Navigation error: ${navigationError.message}`);
    // Try to render anyway - certificate might be partially loaded
    console.log(`[PDF Renderer] Attempting to render partially loaded page...`);
  }

  // Emulate screen media type for proper rendering
  await page.emulateMediaType("screen");

  // Generate PDF with optimized settings
  await page.pdf({
    path: outputPath,
    format: "A4",
    landscape: orientation !== "portrait",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" }
  });

  console.log(`[PDF Renderer] PDF generated successfully at: ${outputPath}`);
  process.exit(0);

} catch (error) {
  console.error(`[PDF Renderer] FATAL ERROR: ${error.message}`);
  console.error(`[PDF Renderer] Stack trace: ${error.stack}`);
  process.exit(1);

} finally {
  // Ensure browser is closed even if errors occur
  if (browser) {
    try {
      await browser.close();
      console.log(`[PDF Renderer] Browser closed successfully`);
    } catch (closeError) {
      console.error(`[PDF Renderer] Error closing browser: ${closeError.message}`);
    }
  }
}
