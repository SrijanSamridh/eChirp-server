const router = require('express').Router();
const { getGroups, createGroup, updateGroup, getUnknownGroups } = require('../controllers/groups');
const Auth = require('../middlewares/auth.js');

router.route("/")
    .get(Auth, getGroups)
    .post(Auth, createGroup)
    .put(Auth, updateGroup);

router.route("/all")
    .get(Auth, getUnknownGroups);

module.exports = router;