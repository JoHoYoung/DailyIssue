var Channels = ['NAVER_News_Main','Think_Good']

module.exports.Channels = Channels
module.exports.asyncWrapper = fn => (req, res, next) => {Promise.resolve(fn(req,res,next)).catch(next)}