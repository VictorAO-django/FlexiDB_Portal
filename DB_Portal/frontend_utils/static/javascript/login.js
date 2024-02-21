import {Consumer, SetAuthToken, GetAuthToken} from './utilities.js'


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


function Login(){
    var url = 'http://localhost:8000/portal/auth/login/'
    var LoginForm = document.getElementById('login-form')
    var email = LoginForm.elements["email"].value
    var password = LoginForm.elements["password"].value
    var payload = {
        "email": email,
        "password": password
    }
    var response = new Consumer(url, payload, 'POST')
    var data = response.fetch_response()
    alert(data)
}



document.addEventListener("DOMContentLoaded",function(){
    var login = document.getElementById('submit');
    login.addEventListener('click', Login)
})