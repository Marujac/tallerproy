const fs = require('fs');
const path = require('path');
const { launch } = require('chrome-launcher');
const lighthouse = require('lighthouse');

const targetUrl = process.argv[2] || 'http://localhost:3000/projects';
const outputDir = process.argv[3] || './energy-reports';
const lhConfig = require('../.lighthouserc.json');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function timestamp() {
  return new Date().toISOString().replace(/[:]/g, '-').slice(0, 19);
}

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

function extractReport(result) {
  const reports = Array.isArray(result.report) ? result.report : [result.report];
  const html = reports.find((item) => typeof item === 'string' && item.trim().startsWith('<'));
  const jsonString = reports.find((item) => typeof item === 'string' && item.trim().startsWith('{'));
  const reportJson =
    typeof jsonString === 'string'
      ? JSON.parse(jsonString)
      : typeof jsonString === 'object'
        ? jsonString
        : result?.lhr;
  return { html, json: reportJson };
}

async function main() {
  ensureDir(outputDir);
  const stamp = timestamp();
  const htmlPath = path.join(outputDir, `audit-${stamp}.html`);
  const jsonPath = path.join(outputDir, `audit-${stamp}.json`);

  let chrome;
  try {
    chrome = await launch({ chromeFlags: ['--headless', '--no-sandbox'] });
    const options = { logLevel: 'info', output: ['html', 'json'], port: chrome.port };
    const runnerResult = await lighthouse(targetUrl, options, lhConfig);
    const { html, json } = extractReport(runnerResult);

    if (html) fs.writeFileSync(htmlPath, html, 'utf-8');
    if (json) fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf-8');

    const audits = json?.audits || {};
    const metrics = {
      performance: runnerResult.lhr?.categories?.performance?.score || 0,
      fcp: audits['first-contentful-paint']?.displayValue,
      lcp: audits['largest-contentful-paint']?.displayValue,
      tbt: audits['total-blocking-time']?.displayValue,
      cls: audits['cumulative-layout-shift']?.displayValue,
      totalBytes: audits['total-byte-weight']?.displayValue,
      requests: audits['network-requests']?.displayValue,
      energy: estimateEnergy(json || runnerResult.lhr || {}),
    };

    console.log('Lighthouse report saved:');
    console.log(`  HTML:  ${htmlPath}`);
    console.log(`  JSON:  ${jsonPath}`);
    console.log('\nResumen:');
    console.log(`  Performance: ${Math.round(metrics.performance * 100) || 0}`);
    console.log(`  FCP: ${metrics.fcp} | LCP: ${metrics.lcp} | TBT: ${metrics.tbt} | CLS: ${metrics.cls}`);
    console.log(`  Requests: ${metrics.requests} | Peso total: ${metrics.totalBytes}`);
    console.log(`  Energia estimada (Wh): ${metrics.energy.toFixed(4)}`);
  } catch (error) {
    console.error('No se pudo ejecutar Lighthouse para medir energia:', error);
    process.exitCode = 1;
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

main();
