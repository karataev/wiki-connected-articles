const request = require('request');
const cheerio = require('cheerio');

const BASE_URL = 'https://ru.wikipedia.org/wiki/';

function loadAndParsePage(name, cb) {
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

loadAndParsePage('JavaScript', res => {
  console.log(res);
/*
  res.links.forEach(link => {
    console.log(`"${res.pageTitle}" -> "${link}"`);
    loadAndParsePage(link, res => {
      // console.log(`> ${link}`);
      res.links.forEach(link => {
        console.log(`"${res.pageTitle}" -> "${link}"`);
      })
    })
  })
*/
});
