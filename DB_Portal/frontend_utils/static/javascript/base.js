import {DropDown, CloseDropDown} from './utilities.js'

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

function searchFilter(value){
    var key = document.getElementById('filter-key')
    key.innerText = value
    CloseDropDown()
}

document.addEventListener("DOMContentLoaded",function(){
    var account = document.getElementsByClassName('account')[0];
    account.addEventListener('click', function(){
        var fields = {
            'Account': 'account',
            'Profile': 'profile',
            'Billing' : 'billing',
            'Delete': 'account/delete/'
        }
        var dropdown = new DropDown('account', fields, true)
        dropdown.open()
    })


    var search = document.getElementById('search-filter');
    search.addEventListener('click', function(){
        var fields = {
            'first name': 'first_name',
            'username': 'username',
            'email' : 'email',
            'organization': 'organization'
        }
        var dropdown = new DropDown('filter', fields, false, true)
        dropdown.open()
    })
})