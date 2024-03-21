import {Consumer, SetAuthToken, DeleteAuthToken, CustomAlert, Redirect, delay, get_queryparams, observer, Assert} from './utilities.js'

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


document.addEventListener("DOMContentLoaded", function(){
    var my_profile = document.getElementById('my-profile')
    my_profile.addEventListener('click', function(){
        alert(get_queryparams('tab'))
        if(get_queryparams('tab') == 'My Profile'){
            alert('yipa')
        }
    })
})