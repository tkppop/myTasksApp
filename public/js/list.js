//Elements
const $refreshButton = document.querySelector('#refresh_tasks')
const $taskContainer = document.querySelector('#task_container')
const $addTaskButton = document.querySelector('#add_task_modal')
const $addNewTaskForm = document.querySelector('#addNewTaskForm')
const $newTaskName = document.querySelector('#form34')
const $newTaskDetails = document.querySelector('#form8')

//Templates
const taskListTemplate = document.querySelector('#task_list_template').innerHTML

document.addEventListener('DOMContentLoaded', (e) => {
    // return console.log('test on load')
    let tokenID = localStorage.getItem('accessToken')
    if (tokenID == undefined) {
        window.location.href ='/'
    }

    // const authString = `Bearer ${tokenID}`
    // console.log(authString)
    getMyTasks()
})

$addNewTaskForm.addEventListener('submit', (e) => {
    e.preventDefault()
    // console.log("Submitted from modal")
    // console.log($newTaskName.value)
    // console.log($newTaskDetails.value)
    // console.log(document.querySelector('input[name="taskStatus"]:checked').value)
    const taskName = $newTaskName.value
    let taskStatus = false
    if (document.querySelector('input[name="taskStatus"]:checked').value == 'completed') {
        taskStatus = true
    }
    addNewTask(taskName, taskStatus)
    $('#addTaskForm').modal('toggle')
})

const getMyTasks = () => {
    let tokenID = localStorage.getItem('accessToken')
    let authString = `Bearer ${tokenID}`
    const url = '/tasks' 
    fetch (url, {
        method: 'GET',
        headers: {
            "Content-type": "application/json",
            "Authorization": authString
        }
    }).then((response) => {
        if (response.status !== 200 ){
            console.log('Looks like there was a problem. Status Code: ' + response.status)
            return
        }
        response.json().then((data) => {
            const tasks = []
            data.forEach( (element) => {
                let item = {}
                item.taskName = element.taskName
                item.taskID = element._id
                item.createdAt = moment(element.createdAt).format('M/D ddd h:mm a')
                if(element.taskStatus) {
                    item.taskStatus = 'Completed'
                }else {
                    item.taskStatus = 'Pending'
                }
                item.lastUpdated = moment(element.updatedAt).fromNow()
                tasks.push(item)
                //console.log(item)
            })

            const renderTasks = Handlebars.compile(taskListTemplate)

            //console.log(tasks)
            $taskContainer.innerHTML = renderTasks({tasks})
        })
    })
    .catch((err) => {
        console.log('Fetch error ', err)
    })
}

const addNewTask = (task, status) => {
    let tokenID = localStorage.getItem('accessToken')
    let authString = `Bearer ${tokenID}`
    const url = '/tasks' 
    fetch (url, {
        method: 'POST',
        headers: {
            "Content-type": "application/json",
            "Authorization": authString
        },
        body: JSON.stringify({ 
            "taskName" : task,
            "taskStatus" : status
        })
    }).then((response) => {
        if (response.status !== 201 ){
            console.log('Looks like there was a problem. Status Code: ' + response.status)
            return
        }
        response.json().then((data) => {
            console.log(data)
            const tasks = []
            let item = {}
            item.taskName = data.taskName
            item.taskID = data._id
            item.createdAt = moment(data.createdAt).format('M/D ddd h:mm a')
            if(data.taskStatus) {
                item.taskStatus = 'Completed'
            }else {
                item.taskStatus = 'Pending'
            }
            item.lastUpdated = moment(data.updatedAt).fromNow()
            //console.log(item)
            tasks.push(item)
            const renderNewTask = Handlebars.compile(taskListTemplate)
            $taskContainer.insertAdjacentHTML('afterbegin', renderNewTask({tasks}))
            // $taskContainer.innerHTML = renderNewTask({item})
            
        })
    })
    .catch((err) => {
        console.log('Fetch error ', err)
    })
}


const deleteTask = (node, id) => {
    //console.log('delete link clicked ', id)
    let tokenID = localStorage.getItem('accessToken')
    let authString = `Bearer ${tokenID}`
    const url = `/tasks/${id}` 
    //console.log(url)
    fetch (url, {
        method: 'DELETE',
        headers: {
            "Content-type": "application/json",
            "Authorization": authString
        }
    }).then( (response) => {
        if (response.status !== 200 ){
            console.log('Looks like there was a problem. Status Code: ' + response.status)
            return
        }
        node.parentNode.parentNode.parentNode.remove()
    })
    .catch((err) => {
        console.log('Fetch error ', err)
    })

}

const completeTask = (node, id) => {
    let tokenID = localStorage.getItem('accessToken')
    let authString = `Bearer ${tokenID}`
    const url = `/tasks/${id}` 
    fetch (url, {
        method: 'PATCH',
        headers: {
            "Content-type": "application/json",
            "Authorization": authString
        },
        body: JSON.stringify({ 
            "taskStatus" : true
        })
    }).then( (response) => {
        if (response.status !== 200 ){
            console.log('Looks like there was a problem. Status Code: ' + response.status)
            return
        }
        node.parentNode.parentNode.parentNode.remove()
        response.json().then((data) => {
            console.log(data)
            const tasks = []
            let item = {}
            item.taskName = data.taskName
            item.taskID = data._id
            item.createdAt = moment(data.createdAt).format('M/D ddd h:mm a')
            if(data.taskStatus) {
                item.taskStatus = 'Completed'
            }else {
                item.taskStatus = 'Pending'
            }
            item.lastUpdated = moment(data.updatedAt).fromNow()
            //console.log(item)
            tasks.push(item)
            const renderNewTask = Handlebars.compile(taskListTemplate)
            $taskContainer.insertAdjacentHTML('afterbegin', renderNewTask({tasks}))
            // $taskContainer.innerHTML = renderNewTask({item})
            
        })
    })
    .catch((err) => {
        console.log('Fetch error ', err)
    })
}

const logoff = () => {
    let tokenID = localStorage.getItem('accessToken')
    let authString = `Bearer ${tokenID}`
    const url = '/users/logout' 
    fetch (url, {
        method: 'POST',
        headers: {
            "Content-type": "application/json",
            "Authorization": authString
        }
    }).then((response) => {
        console.log(response.status)
        if (response.status !== 200 ){
            console.log('Looks like there was a problem. Status Code: ' + response.status)
            return
        }
        localStorage.clear()
        window.location.href = '/'
    })
    .catch((err) => {
        console.log('Fetch error ', err)
    })
}