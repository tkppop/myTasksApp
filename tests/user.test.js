const request = require('supertest')

const app = require('../src/app')
const User = require('../src/models/user')

const { userOneId, userOne, setupDatabase} = require('./fixtures/db')


//Runs before each test case
beforeEach(setupDatabase)

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Andy',
        email: 'andy@testmail.com',
        password: 'Mypass1234!'
    }).expect(201)

    //Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //Assertions about the body, single item
    expect(response.body.user.name).toBe('Andy')
    //Assertions about the body, mutiple items
    //toMatchOject will check if these are present, the input object can have more properties
    expect(response.body).toMatchObject({
        user: {
            name: 'Andy',
            email: 'andy@testmail.com',
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('Mypass1234!')
})

test('Should login existing user', async () => {
    const loginResponse = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
    //Assert that the database was changed correctly
    const user = await User.findById(userOneId)
    expect(user).not.toBeNull()
    expect(user.tokens[1].token).toBe(loginResponse.body.token)
})

test('Should not login nonexisting user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email+'test',
        password: userOne.password+'pass'
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete profile for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200)
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update existing user with valid fields', async () => {
    const updateResponse = await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        age: 34,
        name: 'Prasanna'
    })
    .expect(200)
    //Assert that the database was changed correctly
    const user = await User.findById(userOneId)
    expect(user).not.toBeNull()
    expect(user).toMatchObject({
        name: 'Prasanna',
        age: 34
    })
})

test('Should fail update existing user with invalid fields', async () => {
    const updateResponse = await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        goal: 34
    })
    .expect(400)
    //Assert that the database was changed correctly
    expect(updateResponse).not.toBeNull()
    expect(updateResponse.body).toMatchObject({
        error: 'Invalid Update!'
    })
})