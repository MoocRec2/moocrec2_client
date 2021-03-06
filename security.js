// var baseUrl = 'http://ec2-18-221-22-226.us-east-2.compute.amazonaws.com:3000'
var baseUrl = 'http://localhost:3001'

function checkLogin() {
    $.ajax({
        type: "GET",
        url: baseUrl + '/users/check-auth',
        headers: {
            authorization: 'Bearer ' + localStorage.getItem('token')
        },
        success: data => {
            var firstName = localStorage.getItem('firstName')
            var lastName = localStorage.getItem('lastName')

            var name = document.getElementById('end_user_name')
            name.textContent = firstName + ' ' + lastName
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
        data: JSON.stringify({
            username: username,
            password: password
        }),
        contentType: "application/json; charset=utf-8",
        success: data => {
            localStorage.setItem('token', data.token)
            localStorage.setItem('username', data.username)
            localStorage.setItem('firstName', data.firstName)
            localStorage.setItem('lastName', data.lastName)
            localStorage.setItem('all', JSON.stringify(data))
            window.location.href = 'index.html'
        },
        error: error => {
            alert('ERROR')
        }
    })
}

function getUserDetails() {
    $.ajax({
        type: "GET",
        url: baseUrl + '/users/user-details/' + localStorage.getItem('username'),
        contentType: "application/json; charset=utf-8",
        success: data => {
            var username = document.getElementById('username')
            var firstName = document.getElementById('firstName')
            var lastName = document.getElementById('lastName')
            username.textContent = localStorage.getItem('username')
            firstName.textContent = localStorage.getItem('firstName')
            lastName.textContent = localStorage.getItem('lastName')

            var userAll = JSON.parse(localStorage.getItem('all'));
            var temp = userAll.all.style;

            var userDiv = document.getElementById('preferredStylesUser');
            if (temp) {

                var userStyles = userAll.all.style.PreferedStyles;
                var yourSpan = document.createElement('span');
                var styles = ['badge badge-success', 'badge badge-primary', 'badge badge-info', 'badge badge-secondary', 'badge badge-danger']
                var i = 0;
                userStyles.forEach(style => {
                    i++;
                    var yourSpan = document.createElement('span');
                    yourSpan.innerText = style;
                    yourSpan.id = "style_span" + style;
                    yourSpan.className = styles[i];
                    yourSpan.style = "margin:2px"
                    userDiv.appendChild(yourSpan);
                });
            } else {
                userDiv.innerHTML = '<a class="btn btn-primary" href="session-intro.html">Find Style</a>'
            }

        },
        error: error => {
            alert('ERROR')
        }
    })
}

function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('firstName')
    localStorage.removeItem('lastName')
    localStorage.removeItem('username')
    localStorage.removeItem('all')
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
        data: JSON.stringify({
            firstName: firstName,
            lastName: lastName,
            username: username,
            password: password
        }),
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