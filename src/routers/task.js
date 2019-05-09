//task.js
const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')

const router = new express.Router()

router.post('/tasks', auth , async (req, res) => {
    //const task = new Task(req.body)
    // Refactoring code above to add owner
    const task = new Task ({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// limit is the page limit and skip is how many items to skip from the start
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    try {
        // This below logic handles -> null (which is bring all), true or false
        const match = {}
        const sort = {}
        if (req.query.completed) {
            match.taskStatus = req.query.completed === 'true'
        }
        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':')
            //Example ternary operator, if the condition is true, the value from the left is set else the other one
            sort[parts[0]] = parts[1] === 'desc' ? -1:1
        }
        // allTasks = await Task.find({owner: req.user._id})
        // if (!allTasks || allTasks.length===0) {
        //     return res.status(404).send('No tasks.')
        // }
        // res.send(allTasks)
        // An alternative way is use populate on the vertial task association on user model
        await req.user.populate({
            path: 'tasks',
            match,
            options : {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        //task1 = await Task.findById(_id)
        const task1 = await Task.findOne({_id, owner: req.user._id})
        if(!task1){
            return res.status(404).send('No tasks with that Id.')
        }
        res.send(task1)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    // validation code for validation properties
    //similar patch operation in users
    const updates = Object.keys(req.body)
    const allowedUpdates = ['taskName', 'taskStatus']
    const isAllowedupdate = updates.every((updateAction) => allowedUpdates.includes(updateAction))
    if (!isAllowedupdate) {
        return res.status(400).send({error: "Invalid Update!"})
    }
    
    try {
        //This bypasses mongoose and directly hits mongoDB, which is why we set additional parameters
        //and hence will not hit mongoose middleware funtions like 'pre' and 'post'
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        //Refactored code below to use all mongoose funtions,
        //const task = await Task.findById(req.params.id)
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if (!task) {
            return res.status(404).send()
        }
        updates.forEach((updatedField) => task[updatedField] = req.body[updatedField])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth , async (req, res) => {
    try {
        const taskToDel = await Task.findOneAndDelete({_id: req.params.id, owner : req.user._id})
        if (!taskToDel) {
            return res.status(404).send({error:"Task not found"})
        }
        res.send(taskToDel)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router