const router = require('express').Router();
const { getGroups, createGroup, updateGroup } = require('../controllers/groups');
const Auth = require('../middlewares/auth.js');

router.route("/")
    .get(Auth, getGroups)
    .post(Auth, createGroup)
    .put(Auth, updateGroup);

module.exports = router;