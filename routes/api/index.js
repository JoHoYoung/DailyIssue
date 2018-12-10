const router = require("express").Router()

router.use("/channel", require("./channel"))
router.use("/profile", require("./profile"))
router.use("/auth", require("./auth"))
module.exports = router
