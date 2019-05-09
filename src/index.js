const fs = require('fs');
const request = require('request-promise-native');
const cheerio = require('cheerio');
const _ = require('lodash');

const BASE_URL = 'https://en.wikipedia.org/wiki/';

function loadAndParsePage(name) {
  console.log(`Fetch ${name}...`);
  allLinks.push(name);
  counter++;
  let url = `${BASE_URL}${encodeURIComponent(name)}`;
  let pageTitle;
  let result = [];

  return request(url)
    .then((response) => {
      const $ = cheerio.load(response);
      pageTitle = $('h1').text();
      $('h2:contains("See also")').nextAll('ul').first().find('li > a').each((index, node) => {
        let title = $(node).text();
        result.push(title);
      });

      return {
        pageTitle,
        links: result,
      };
    })
    .catch(err => {
      // console.log('ERROR', err);
      return null;
    })
}

let pages = [];
let counter = 0;
const MAX_COUNT = 10;
let allLinks = ['AngularJS'];

function generateFinalGraph() {
  let result = [];
  pages.forEach(page => {
    page.links.forEach(link => {
      result.push(`"${page.pageTitle}" -> "${link}"`);
    })
  });
  fs.writeFileSync('output.txt', result.join('\n'));
  console.log('--- DONE ---');
}

async function processResult(res) {
  if (!res) return;
  pages.push(res);
  console.log(res);

  let promises = res.links
    .filter(link => {
      if (counter >= MAX_COUNT) return false;
      if (link.indexOf('disambiguation') >= 0) return false;
      if (allLinks.indexOf(link) >= 0) return false;
      return link;
    })
    .map(link => {
      return loadAndParsePage(link);
    });

  await Promise.all(promises)
    .then(async results => {
      for (let i = 0; i < results.length; i++) {
        await processResult(results[i]);
      }
    });
}


async function start() {
  await loadAndParsePage(allLinks[0])
    .then(processResult);

  generateFinalGraph();
}

start();
