const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function testInfra() {
  console.log('--- AutoPilot AI Infrastructure Verification ---');

  console.log('1. Verifying SQLite & Prisma connection...');
  const prisma = new PrismaClient();
  try {
    const sessionCount = await prisma.session.count();
    console.log(`   Success! Prisma connected. Existing session count: ${sessionCount}`);
  } catch (err) {
    console.error('   Error! Database connection failed:', err.message);
  }

  console.log('2. Verifying Playwright launching capability...');
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://example.com');
    const title = await page.title();
    console.log(`   Success! Page title of example.com: "${title}"`);

    const screenshotDir = path.join(__dirname, 'public', 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    const screenshotPath = path.join(screenshotDir, 'test-verify.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`   Success! Screenshot captured to: ${screenshotPath}`);

    await browser.close();
  } catch (err) {
    console.error('   Error! Playwright browser launch failed:', err.message);
  }

  await prisma.$disconnect();
  console.log('--- Verification Complete ---');
}

testInfra();
