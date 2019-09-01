
var baseUrl = 'http://localhost:3000'

function checkLogin() {
    $.ajax({
        type: "GET",
        url: baseUrl + '/users/check-auth',
        headers: {
            authorization: 'Bearer ' + localStorage.getItem('token')
        },
        success: data => {
            console.log('SUCCESS PATH')
        },
        error: error => {
            console.log('ERROR PATH')
            window.location.href = "login.html"
        }
    })
}

function login() {
    var username = document.getElementById('username').value
    var password = document.getElementById('password').value
    $.ajax({
        type: "POST",
        url: baseUrl + '/users/login',
        data: JSON.stringify({ username: username, password: password }),
        contentType: "application/json; charset=utf-8",
        success: data => {
            localStorage.setItem('token', data.token)
            window.location.href = 'index.html'
        },
        error: error => {
            alert('ERROR')
        }
    })
    // TODO: Set profile pic url
    // TODO: Set name
}

function logout() {
    localStorage.removeItem('token')
    window.location.href = "login.html"
}

function register() {

    var firstName = document.getElementById('firstName').value
    var lastName = document.getElementById('lastName').value
    var username = document.getElementById('username').value
    var password = document.getElementById('password').value
    var confPassword = document.getElementById('re-password').value

    if (password != confPassword) {
        alert('Passwords Dont Match')
        return
    }
    $.ajax({
        type: "POST",
        url: baseUrl + '/users/register',
        data: JSON.stringify(
            {
                firstName: firstName,
                lastName: lastName,
                username: username,
                password: password
            }
        ),
        contentType: "application/json; charset=utf-8",
        success: data => {
            // localStorage.setItem('token', data.token)
            alert('Registered')
            window.location.href = 'login.html'
        },
        error: error => {
            alert('Couldnt Register')
        }
    })

}