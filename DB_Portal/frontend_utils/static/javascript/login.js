import {Consumer, SetAuthToken, GetAuthToken, CustomAlert, Redirect, delay, get_queryparams} from './utilities.js'


function showErr(msg,URL,lineNum,columnNo,error){
    var errWin = window.open("","osubWin","width=650px,height=600px")
    var winText = "<html><title>Error Window</title>"
    winText += "<body> <p>MSG: " + msg + ".</p>"
    winText += "<p>Document URL: " + URL + ".</p>"
    winText += "<p>Document COLUMN: " + columnNo + ".</p>"
    winText += "<p>Document ERROR: " + console.error(); + ".</p>"
    winText += "<p>Line Number: " + lineNum + ".</p>"
    winText += "</body></html>"
                
    errWin.document.write(winText);
    var oWidth = ((screen.availWidth - 650)/2);
    var oHeight = ((screen.availHeight - 600)/2);
    errWin.moveTo(oWidth,oHeight);
    return true;
}
window.onerror = showErr


async function Login(){
    var url = 'http://localhost:8000/portal/auth/login/'
    var LoginForm = document.getElementById('login-form')
    var email = LoginForm.elements["email"].value
    var password = LoginForm.elements["password"].value
    var payload = {
        "email": email,
        "password": password
    }
    var response = new Consumer(url, payload, 'POST', false, true)
    var data = await response.fetch_response()
    
    SetAuthToken(data['token'])
    var customAlert = new CustomAlert(data['detail'], 'green')
    customAlert.raise()

    await delay(2000)
    
    var nextURL = get_queryparams('next')
    if (nextURL != null){
        nextURL = 'http://localhost:8000/'+nextURL
    }else{
        nextURL = 'http://localhost:8000/portal/dashboard/'
    }
    Redirect(nextURL)
}


async function ForgotPW(){
    var url = 'http://localhost:8000/portal/auth/forget-password/'
    var ForgotPWForm = document.getElementById('forgotPW-form')
    var email = ForgotPWForm.elements["email"].value
    var payload = {
        "email": email,
    }
    var response = new Consumer(url, payload, 'POST', false)
    var data = await response.fetch_response()

    var customAlert = new CustomAlert(data['detail'], 'green')
    customAlert.raise()
}


function forgotPasswordForm(){
    var loginForm = document.getElementById('login-form')
    var forgotPWForm = document.getElementById('forgotPW-form')
    var statement = document.getElementById('statement')
    var subStatement = document.getElementById('statement-span')

    statement.innerText = 'Forgot password'
    subStatement.innerText = "Enter your account's email address"

    loginForm.style.display = 'none'
    forgotPWForm.style.display = 'flex'
}

document.addEventListener("DOMContentLoaded",function(){
    var login = document.getElementById('submit');
    login.addEventListener('click', Login)

    var forgotPwButton = document.getElementById('forgotPW');
    forgotPwButton.addEventListener('click', forgotPasswordForm)

    var forgotPw = document.getElementById('submit-email');
    forgotPw.addEventListener('click', ForgotPW)

    var signUp = document.getElementById('sign-up');
    signUp.addEventListener('click', function(){
        Redirect('http://localhost:8000/portal/portal/register/')
    })
})