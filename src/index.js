const request = require('request-promise-native');
const cheerio = require('cheerio');
const _ = require('lodash');

const exporter = require('./exporter');

const BASE_URL = 'https://en.wikipedia.org';
const MAX_COUNT = 5;

let startUrl = '/wiki/React_(JavaScript_library)';
let counter = 0;
let parsedPages = [];
let visitedLinks = [];

function loadAndParsePage(url) {
  console.log(`Fetch ${url}...`);
  visitedLinks.push(url);
  counter++;

  return request(`${BASE_URL}${url}`)
    .then((response) => {
      const $ = cheerio.load(response);
      let title = $('h1').text();
      let result = [];

      let $seeAlsoLinks = $('h2:contains("See also")').nextAll('ul').first().find('li > a');
      $seeAlsoLinks.each((index, node) => {
        let title = $(node).text();
        let url = $(node).attr('href');
        result.push({title, url});
      });

      return {
        title,
        href: url,
        links: result,
      };
    })
    .catch(err => {
      // console.log('ERROR', err);
      return null;
    })
}

async function processResult(res) {
  if (!res) return;
  parsedPages.push(res);
  console.log(res);

  let promises = res.links
    .filter(link => {
      if (counter >= MAX_COUNT) return false;
      if (link.title.indexOf('disambiguation') >= 0) return false;
      if (visitedLinks.indexOf(link.url) >= 0) return false;
      return link;
    })
    .map(link => {
      return loadAndParsePage(link.url);
    });

  await Promise.all(promises)
    .then(async results => {
      for (let i = 0; i < results.length; i++) {
        await processResult(results[i]);
      }
    });
}


async function start() {
  await loadAndParsePage(startUrl)
    .then(processResult);

  exporter.toFile('output.txt', parsedPages);
}

start();
