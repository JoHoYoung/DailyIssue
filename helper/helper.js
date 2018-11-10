const fetch = require('fetch')
const cheerio = require('cheerio')                  //크롤링을 위한 모듈

function fetcher(url){
    return new Promise((resolve,reject) => {
        fetch.fetchUrl(url, function(error, meta, body){

            let result = [];
            const $ = cheerio.load(body, {
                decodeEntities: false
            });

            body = $('.cluster').text().toString();
            resolve(body.toString());
        });
    })
}

module.exports.fetcher = fetcher
module.exports.asyncWrapper = fn => (req, res, next) => {Promise.resolve(fn(req,res,next)).catch(next)}