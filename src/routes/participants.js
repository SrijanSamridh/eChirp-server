const { getParticipants, addParticipant, removeParticipant } = require('../controllers/participants');
const Auth = require('../middlewares/auth');

const router = require('express').Router();

router.route("/")
    .delete(Auth, removeParticipant)
    .post(Auth, addParticipant);
router.route("/:groupId")
    .get(Auth, getParticipants);

module.exports = router;