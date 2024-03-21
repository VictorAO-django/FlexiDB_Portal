import {Consumer, SetAuthToken, DeleteAuthToken, CustomAlert, Redirect, delay, get_queryparams, observer, Assert} from './utilities.js'


// function showErr(msg,URL,lineNum,columnNo,error){
//     var errWin = window.open("","osubWin","width=650px,height=600px")
//     var winText = "<html><title>Error Window</title>"
//     winText += "<body> <p>MSG: " + msg + ".</p>"
//     winText += "<p>Document URL: " + URL + ".</p>"
//     winText += "<p>Document COLUMN: " + columnNo + ".</p>"
//     winText += "<p>Document ERROR: " + console.error(); + ".</p>"
//     winText += "<p>Line Number: " + lineNum + ".</p>"
//     winText += "</body></html>"
                
//     errWin.document.write(winText);
//     var oWidth = ((screen.availWidth - 650)/2);
//     var oHeight = ((screen.availHeight - 600)/2);
//     errWin.moveTo(oWidth,oHeight);
//     return true;
// }
// window.onerror = showErr

function Validator(){
    var login_form = document.getElementById('login-form')
    var email = login_form.elements['email'].value
    var password = login_form.elements['password'].value
    Assert('.com', 'in', email, 'Please provide a valid email')
    Assert(password.length, 'greater_than', 0, 'Please Provide a password')
}

function Verify(email){
    var parent = document.getElementsByClassName('login-section')[0].querySelector('div')
    var loginForm = document.getElementById('login-form')
    var statement = document.getElementById('statement')
    var subStatement = document.getElementById('statement-span')

    statement.innerText = 'Verify your account'
    subStatement.innerHTML = "For security reasons, we've sent you an email that <br>contains a link to verify your account."
    
    var resend_link = document.createElement('a')
    resend_link.id = 'resend-link'
    resend_link.innerText = 'Resend verification link'
    resend_link.addEventListener('click', async function(){
        if(this.innerText == 'Resend verification link'){
            var payload = {'email': email}
            var url = 'http://localhost:8000/portal/auth/verification-link/'
            var response = new Consumer(url, payload, 'POST', false, true)
            var data = await response.fetch_response()
            
            var customAlert = new CustomAlert(data['detail'], '#1d3b77')
            customAlert.raise()
            this.innerText = 'Verification link sent'
        }
        
    })

    parent.replaceChild(resend_link, loginForm)
}

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

    if(data['detail'] == 'please verify your email'){
        Verify(email)
        throw new Error(data)
    }
    
    SetAuthToken(data['token'])
    var customAlert = new CustomAlert(data['detail'], '#1d3b77')
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


function ResetLinkSent(){
    var forgotPWForm = document.getElementById('forgotPW-form')
    var statement = document.getElementById('statement')
    var subStatement = document.getElementById('statement-span')

    statement.innerText = 'Check your email'
    subStatement.innerText = "We've sent a reset link to your email, click on it"

    forgotPWForm.style.display = 'none'
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

    if(data['detail'] == ""){

    }
    ResetLinkSent()
    var customAlert = new CustomAlert(data['detail'], '#1d3b77')
    customAlert.raise()
}


function forgotPasswordForm(){
    var loginForm = document.getElementById('login-form')
    var forgotPWForm = document.getElementById('forgotPW-form')
    var statement = document.getElementById('statement')
    var subStatement = document.getElementById('statement-span')

    statement.innerText = 'Forgot password?'
    subStatement.innerText = "No worries, we'll send you reset instructions"

    loginForm.style.display = 'none'
    forgotPWForm.style.display = 'flex'
}



document.addEventListener("DOMContentLoaded",function(){
    var content_boxes = document.querySelectorAll('.content-box')
    for(var i=0; i<content_boxes.length; i++){
        var box = content_boxes[i]
        observer.observe(box)
    }

    var password_toggle = this.getElementById('password-toggle')
    password_toggle.addEventListener('click', function(){
        var thisInput = this.parentElement.elements['password']
        if(thisInput.type == 'text'){
            thisInput.type = 'password'
            this.src = '/static/png/password-close.svg'
        }else{
            thisInput.type = 'text'
            this.src = '/static/png/password-view.svg'
        }
    })

    var login = document.getElementById('submit');
    login.addEventListener('click',function(){
        Validator()
        DeleteAuthToken()
        Login()
    })

    var forgotPwButton = document.getElementById('forgotPW');
    forgotPwButton.addEventListener('click', forgotPasswordForm)

    var forgotPw = document.getElementById('submit-email');
    forgotPw.addEventListener('click', function(){
        ForgotPW()
    })

    var signUp = document.getElementById('sign-up');
    signUp.addEventListener('click', function(){
        Redirect('http://localhost:8000/portal/signup/')
    })
})