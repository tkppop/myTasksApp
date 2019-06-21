//Elements
const $loginForm = document.querySelector('#loginform')
const $loginFormUser = $loginForm.querySelector('#username')
const $loginFormkey = $loginForm.querySelector('#password')
const $loginFormButton = $loginForm.querySelector('button')


$loginForm.addEventListener('submit', (e) => {
    e.preventDefault()
    //disable button using dom manipulation
    $loginFormButton.setAttribute('disabled', 'disabled')
    // $loginFormButton.removeAttribute('disabled')
    // console.log('name', $loginFormUser.value)
    // console.log('key', $loginFormkey.value)

    const url = '/users/login' 
    fetch (url, {
        method: 'POST',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({ 
            email : $loginFormUser.value,
            password : $loginFormkey.value
        })
    }).then( (response) => {
        if (response.status !== 200 ){
            console.log('Looks like there was a problem. Status Code: ' + response.status)
            return
        }
        response.json().then((data) => {
            console.log(data.token)
            //sessionStorage.setItem('accessToken', data.token)
            localStorage.setItem('accessToken', data.token)
            //console.log(sessionStorage.getItem('accessToken'))
            window.location.href ='/list'
        })
    })
    .catch((err) => {
        console.log('Fetch error ', err)
    })



    // Another way to access the input from the form
    //const message = e.target.elements.message.value
    //For message acknowledgements, the last argument is the callback function to run.
})