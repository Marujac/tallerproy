const { launch } = require('chrome-launcher');
const lighthouse = require('lighthouse');

const greenUrl = process.env.GREEN_URL || 'http://localhost:3000/projects';
const baselineUrl = process.env.BASELINE_URL || 'http://localhost:3000/projects-standard';
const lhConfig = require('../.lighthouserc.json');

function estimateEnergy(reportJson) {
  const audits = reportJson.audits || {};
  const lcp = audits['largest-contentful-paint']?.numericValue || 0;
  const tbt = audits['total-blocking-time']?.numericValue || 0;
  const cls = audits['cumulative-layout-shift']?.numericValue || 0;

  const lcpFactor = Math.min(lcp / 2500, 1) * 0.1;
  const tbtFactor = Math.min(tbt / 200, 1) * 0.05;
  const clsFactor = Math.min(cls / 0.1, 1) * 0.02;

  return lcpFactor + tbtFactor + clsFactor;
}

async function audit(url, chrome) {
  const options = { logLevel: 'error', output: 'json', port: chrome.port };
  const result = await lighthouse(url, options, lhConfig);
  const report = Array.isArray(result.report) ? result.report[0] : result.report;
  const json = typeof report === 'string' ? JSON.parse(report) : report;
  const audits = json.audits || {};
  return {
    url,
    performance: json.categories?.performance?.score || 0,
    lcp: audits['largest-contentful-paint']?.numericValue || 0,
    tbt: audits['total-blocking-time']?.numericValue || 0,
    cls: audits['cumulative-layout-shift']?.numericValue || 0,
    bytes: audits['total-byte-weight']?.numericValue || 0,
    requests: audits['network-requests']?.details?.items?.length || 0,
    energy: estimateEnergy(json),
  };
}

async function main() {
  let chrome;
  try {
    chrome = await launch({ chromeFlags: ['--headless', '--no-sandbox'] });
    const green = await audit(greenUrl, chrome);
    const baseline = await audit(baselineUrl, chrome);

    const perfImprovement =
      baseline.performance > 0 ? ((green.performance - baseline.performance) / baseline.performance) * 100 : 0;
    const energyImprovement =
      baseline.energy > 0 ? ((baseline.energy - green.energy) / baseline.energy) * 100 : 0;
    const bytesImprovement =
      baseline.bytes > 0 ? ((baseline.bytes - green.bytes) / baseline.bytes) * 100 : 0;

    const fmt = (value) => Math.round(value * 100) / 100;

    console.log('Energy (Wh)');
    console.log(`  Green (optimized):  ${green.energy.toFixed(4)}`);
    console.log(`  Standard (baseline): ${baseline.energy.toFixed(4)}`);
    console.log(`  Improvement:         ${fmt(energyImprovement)}%`);
    console.log('\nPerformance score');
    console.log(`  Green:    ${fmt(green.performance * 100)}`);
    console.log(`  Baseline: ${fmt(baseline.performance * 100)}`);
    console.log(`  Delta:    ${fmt(perfImprovement)}%`);
    console.log('\nLCP / TBT / CLS');
    console.log(
      `  Green:    LCP ${fmt(green.lcp)}ms | TBT ${fmt(green.tbt)}ms | CLS ${green.cls.toFixed(3)}`
    );
    console.log(
      `  Baseline: LCP ${fmt(baseline.lcp)}ms | TBT ${fmt(baseline.tbt)}ms | CLS ${baseline.cls.toFixed(3)}`
    );
    console.log('\nTotal bytes');
    console.log(`  Green:    ${fmt(green.bytes / 1024)} KB`);
    console.log(`  Baseline: ${fmt(baseline.bytes / 1024)} KB`);
    console.log(`  Delta:    ${fmt(bytesImprovement)}% menos`);
    console.log('\nNetwork requests');
    console.log(`  Green:    ${green.requests}`);
    console.log(`  Baseline: ${baseline.requests}`);
  } catch (error) {
    console.error('No se pudo comparar energia:', error);
    process.exitCode = 1;
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

main();
