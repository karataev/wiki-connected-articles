const request = require('request-promise-native');
const cheerio = require('cheerio');
const _ = require('lodash');

const BASE_URL = 'https://ru.wikipedia.org/wiki/';

function loadAndParsePage(name) {
  console.log(`Fetch ${name}...`);
  counter++;
  let url = `${BASE_URL}${encodeURIComponent(name)}`;
  let pageTitle;
  let result = [];

  return request(url)
    .then((response) => {
      const $ = cheerio.load(response);
      pageTitle = $('h1').text();
      $('h2:contains("См. также")').nextAll('ul').first().find('li > a').each((index, node) => {
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

function generateFinalGraph() {
  console.log('--- RESULT ---');
  pages.forEach(page => {
    page.links.forEach(link => {
      console.log(`"${page.pageTitle}" -> "${link}"`);
    })
  })
}

async function processResult(res) {
  if (!res) return;
  pages.push(res);
  console.log(res);

  for (let i = 0; i < res.links.length; i++) {
    let link = res.links[i];
    let page = _.find(pages, {pageTitle: link});
    if (page) continue;
    await loadAndParsePage(link).then(processResult);
    if (counter >= MAX_COUNT) return;
  }
}


async function start() {
  await loadAndParsePage('HTML')
    .then(processResult);

  generateFinalGraph();
}

start();
