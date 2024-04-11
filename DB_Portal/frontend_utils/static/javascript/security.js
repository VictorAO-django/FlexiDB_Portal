import {CustomDialog, CloseDialog, ToolTip, hideToolTip, hasSpecialCharacter, isStrongPassword, passwordToggle, Consumer, Assert, CustomAlert} from './utilities.js'

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

const changePwdForm = document.getElementById('change-pwd-form')
var currentPwd = changePwdForm.elements['current-pwd']
var newPwd = changePwdForm.elements['new-pwd']
var confirmPwd = changePwdForm.elements['confirm-pwd']

function Validator(){
    Assert(currentPwd.value, 'is_not', '', 'Please provide your current password')
    Assert(newPwd.value, 'is_not', '', 'Please provide a new password')
    Assert(confirmPwd.value, 'is_not', '', 'Please confirm the new password')
    Assert(newPwd.value, 'is', confirmPwd.value, 'Password mismatch')
    Assert(currentPwd.value, 'is_not', newPwd.value, 'Your new password cannot be your current password')
    Assert(isStrongPassword(newPwd.value), '', '', 'Password must cotain at least one number and one capital letter')
    Assert(hasSpecialCharacter(newPwd.value), '', '', "Your password must contain a special character like [!@#$%^&*()_+\-[]{};':\"\\|,.<>\/?]")
}

document.addEventListener('DOMContentLoaded', function(){
    var password_toggle = document.getElementsByClassName('toggle')
    for(var i=0; i<password_toggle.length; i++){
        password_toggle[i].addEventListener('click', function(){
            var thisInput = this.parentElement.querySelector('input')
            passwordToggle(thisInput, this)
        })
    }

    var changePassword = document.getElementById('submit')
    changePassword.addEventListener('click', async function(){
        Validator()
        var dialog = new CustomDialog('Confirm','Are you sure you want to continue', 'Continue', 'Cancel').confirm()
        var yesBtn = dialog[0]
        var noBtn = dialog[1]

        yesBtn.addEventListener('click', async function(){
            CloseDialog()
            const payload = {
                "old_password": currentPwd.value,
                "new_password": newPwd.value
            }
            var endpoint = new Consumer('http://localhost:8000/portal/auth/change-password/', payload, 'POST', true, true)
            var response = await endpoint.fetch_response()
    
            currentPwd.value = ''
            newPwd.value = ''
            confirmPwd.value = ''
    
            var alert = new CustomAlert(response['detail'], '#1d3b77')
            alert.raise()
        })

        noBtn.addEventListener('click', function(){
            CloseDialog()
        })
    })

    var sign_device_out = document.getElementsByClassName("sign-device-out")[0]
    sign_device_out.addEventListener('mouseover', function(){
        ToolTip(this, 'sign out')
    })
    sign_device_out.addEventListener('mouseout', hideToolTip)
})