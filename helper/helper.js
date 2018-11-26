var Channels = ['Sample1','Sample2','Sample3','Sample4','Sample5']

module.exports.Channels = Channels
module.exports.asyncWrapper = fn => (req, res, next) => {Promise.resolve(fn(req,res,next)).catch(next)}