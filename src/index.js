const request = require('request');
const cheerio = require('cheerio');
const _ = require('lodash');

const BASE_URL = 'https://ru.wikipedia.org/wiki/';

function loadAndParsePage(name, cb) {
  counter++;
  let url = `${BASE_URL}${encodeURIComponent(name)}`;
  let pageTitle;
  let result = [];

  request(url, function (error, response, body) {
    const $ = cheerio.load(body);
    pageTitle = $('h1').text();
    $('h2:contains("См. также")').nextAll('ul').first().find('li > a').each((index, node) => {
      let title = $(node).text();
      result.push(title);
    });

    cb({
      pageTitle,
      links: result,
    });
  })
}

let pages = [];
let counter = 0;

function generateFinalGraph() {
  console.log('--- RESULT ---');
  pages.forEach(page => {
    page.links.forEach(link => {
      console.log(`"${page.pageTitle}" -> "${link}"`);
    })
  })
}

function processResult(res) {
  console.log(res.pageTitle);
  pages.push(res);
  res.links.forEach(link => {
    let page = _.find(pages, {pageTitle: link});
    if (!page) loadAndParsePage(link, processResult);
  });
  counter--;
  if (counter === 0) {
    generateFinalGraph();
  }
}

loadAndParsePage('JavaScript', processResult);
