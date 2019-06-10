const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { 
    taskOne,
    taskTwo,
    taskThree, 
    userOne, 
    userTwo, 
    setupDatabase
} = require('./fixtures/db')


//Runs before each test case
beforeEach(setupDatabase)

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            taskName: 'Check Inogen'
        })
        .expect(201)
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.taskStatus).toEqual(false)
})

test('Should get user tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body).not.toBeNull()
    expect(response.body.length).toBe(2)
})

test('Test delete user task security', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
    const task = await Task.findById(taskOne._id)
    expect(task.body).not.toBeNull()
})