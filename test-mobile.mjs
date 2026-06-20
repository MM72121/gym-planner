import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set mobile viewport (390px width)
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
  });

  // Test home page
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: '/tmp/mobile-home.png' });
  console.log('✓ Home page screenshot taken');

  // Test exercises page
  await page.goto('http://localhost:3000/exercises', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: '/tmp/mobile-exercises.png' });
  console.log('✓ Exercises page screenshot taken');

  // Test volume page
  await page.goto('http://localhost:3000/volume', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: '/tmp/mobile-volume.png' });
  console.log('✓ Volume page screenshot taken');

  // Test recommend page
  await page.goto('http://localhost:3000/recommend', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: '/tmp/mobile-recommend.png' });
  console.log('✓ Recommend page screenshot taken');

  // Test preferences page
  await page.goto('http://localhost:3000/preferences', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: '/tmp/mobile-preferences.png' });
  console.log('✓ Preferences page screenshot taken');

  // Test import page
  await page.goto('http://localhost:3000/import', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: '/tmp/mobile-import.png' });
  console.log('✓ Import page screenshot taken');

  await browser.close();
  console.log('\n✓ All mobile viewport tests completed!');
})();
