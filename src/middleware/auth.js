//auth.js
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
	try{
		const token = req.header('Authorization').replace('Bearer ', '')
		//const decoded = jwt.verify(token, 'thisisatest')
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
		if (!user) {
			throw new Error()
		}
		//adding the user details and token for downstream usage, so that they dont have call findOne for user.
		req.user = user
		req.token = token
		next()
	} catch (e) {
		res.status(401).send({ error: ' Please authenticate'})
	}
}

module.exports = auth
