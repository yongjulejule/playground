const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const html = `
<!DOCTYPE html>
<html lang="en">
<body>Hello?</body>
</html>
`;

const handler = async (event) => {
  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // await page.addStyleTag({ path: "./test.css" });
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({ format: "A4" });

    return {
      statusCode: 200,
      body: pdf.toString("base64"),
      headers: {
        "Content-Type": "application/pdf",
      },
      isBase64Encoded: true,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};

module.exports = { handler };
