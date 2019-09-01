

login_flag_name = 'logged_in'

function checkLogin() {
    if (!localStorage.getItem(login_flag_name)) {
        window.location.href = "login.html"
    }
}

function login() {
    localStorage.setItem(login_flag_name, true)
}

function logout() {
    localStorage.removeItem(login_flag_name)
    window.location.href = "login.html"
}