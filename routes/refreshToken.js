const { Router } = require("express");
const jwt = require("jsonwebtoken");
const jf = require('jsonfile')
const UserToken = jf.readFileSync('./models/UserToken.json').userToken
const verifyRefreshToken = require("../utils/verifyRefreshToken.js");
const auth = require('../middleware/auth.js')

const logger = require('../utils/winston.js')

const router = Router();

// get new access token
router.post("/", auth, async (req, res) => {
    verifyRefreshToken(req.session['refreshToken'])
        .then(({ tokenDetails }) => {
            const payload = { _id: tokenDetails._id, roles: tokenDetails.roles };
            const accessToken = jwt.sign(
                payload,
                process.env.ACCESS_TOKEN_PRIVATE_KEY,
                { expiresIn: "14m" }
            );
            res.status(200).json({
                error: false,
                accessToken,
                message: "Access token created successfully",
            });
        })
        .catch((err) => {
            logger.error('error in login: '+err)
            res.status(400).json(err)
        });
});

// logout
router.delete("/logout", auth, async (req, res) => {
    try {
        jf.readFile('./models/UserToken.json', (err, obj) => {
            if (err) throw err;
            const fileObj = obj;
            const userToken = fileObj.userToken.find(el => el.token == req.session.refreshToken);
            if (!userToken)
            return res
                .status(200)
                .json({ error: false, message: "Not Logged In" });
            fileObj.userToken.splice(obj.userToken.findIndex(el => el.token == req.session.refreshToken), 1);
            jf.writeFile('./models/UserToken.json', fileObj, {spaces: 2}, (err) => { if (err) throw err })
            req.session.destroy();
            res.clearCookie('123')
            res.status(200).json({ error: false, message: "Logged Out Sucessfully" });
        });
    } catch (err) {
        console.log(err);
        logger.error('error in login: '+err)
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

module.exports = router;