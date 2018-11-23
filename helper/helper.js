const fetch = require('fetch')
const cheerio = require('cheerio')                  //크롤링을 위한 모듈
const moment = require('moment')

function NaverRightsideFetcher(){
    return new Promise((resolve,reject) => {
        fetch.fetchUrl("https://news.naver.com/main/home.nhn", function(error, meta, body){

            let result = [];
            const $ = cheerio.load(body);

            $("#container > div.main_aside > div.section.section_wide > div").each(function(index, obj){
                console.log(index)
            let keyword = $(this).find("h5").text()
                console.log(keyword)
            $(this).find("ul > li ").each(function(index, obj){
                let contents = $(this).find("a").text();
                console.log(contents)
            })
            })

            resolve("hihi");
        });
    })
}

module.exports.NaverRightsideFetcher = NaverRightsideFetcher
module.exports.asyncWrapper = fn => (req, res, next) => {Promise.resolve(fn(req,res,next)).catch(next)}