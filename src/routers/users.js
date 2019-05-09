//users.js
const express = require('express')
const users = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendGoodbyeEmail } = require('../emails/account')

const router = new express.Router()

router.post('/users', async (req, res) => {
    const user = new users(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email,user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) =>{
	try {
		//findByCredential() is a custom method on users models
		const registeredUser = await users.findByCredentials(req.body.email, req.body.password)
		const token = await registeredUser.generateAuthToken()
		res.send({registeredUser, token})
	} catch (e) {
		res.status(400).send(e.name+ " " + e.message)
	}
})

router.post('/users/logout', auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token !== req.token 
		})
		await req.user.save()
		res.send()
	} catch (e) {
		res.status(500).send(e)
	}
})

router.post('/users/logoutAll', auth, async (req, res) => {
	try {
		req.user.tokens = []
		await req.user.save()
		res.send()
	} catch (e) {
		res.status(500).send(e)
	}
})

router.get('/users/me', auth ,async (req, res) => {
	// refectoring for new route and calling middleware function auth
	res.send(req.user)
	//old code
    // try{
    //     const allUsers = await users.find({})
    //     if (!allUsers || allUsers.length===0) {
    //         return res.status(404).send('No users in Users collection.')
    //     }
    //     res.send(allUsers)
    // } catch (e) {
    //     res.status(500).send(e)
    // }
})

router.patch('/users/me', auth , async (req, res) => {
    // validation code for validation properties
    //converts object into an array of keys
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    //one line arrow function short hand
    //Every() returns true for any condition put on an empty array. If one fails, it returns false.
    const isAllowedupdate = updates.every((updateAction) => allowedUpdates.includes(updateAction))
    
    if (!isAllowedupdate) {
        return res.status(400).send({error: "Invalid Update!"})
    }
    
    try {
        //This bypasses mongoose and directly hits mongoDB, which is why we set additional parameters
        //and hence will not hit mongoose middleware funtions like 'pre' and 'post'
        //const user = await users.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        //Refactored code below to use all mongoose funtions,
        //const user = await users.findById(req.params.id)
        //Arrow function shorthard below since it's just one line.
        //updates.forEach((updatefield) => user[updatefield] = req.body[updatefield])
        //await user.save()

        //Refactored for auth (old code above)
        updates.forEach((updatedfield) => req.user[updatedfield] = req.body[updatedfield])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
    	// Refactor - As we don't to check if the user exists since auth does that.
        // const userToDel = await users.findByIdAndDelete(req.users._id)
        // if (!userToDel) {
        //     return res.status(404).send({error:"User not found"})
        // }
        await req.user.remove()
        sendGoodbyeEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

//setting up middleware for multer
const upload = multer({
    // If dest is set it will store it there, else it will pass the file to req.file.buffer
    //dest: 'avatars',
    limits: {
        fileSize : 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image file'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar') ,async (req,res) => {
    //req.user.avatar = req.file.buffer
    // sharp module is used to compress and resize images
    const buffer = await sharp(req.file.buffer).png().resize({width:250, height:250}).toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error : error.message})
})

router.delete('/users/me/avatar', auth , async (req,res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await users.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router