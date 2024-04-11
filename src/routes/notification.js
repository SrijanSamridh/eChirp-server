const router = require("express").Router();
const { sendNotification, replyToNotification, getNotifications } = require("../controllers/notification.js");
const verifyAuth = require("../middlewares/auth.js");

router.route("/")
    .post(verifyAuth, sendNotification)
    .put(verifyAuth, replyToNotification)
    .get(verifyAuth, getNotifications);

module.exports = router;