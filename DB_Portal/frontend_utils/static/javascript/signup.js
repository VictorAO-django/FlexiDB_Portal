import {DropDown,onIntersection, hasSpecialCharacter, isStrongPassword, passwordToggle, CloseDropDown, Consumer, Assert, Redirect, CustomAlert, DeleteAuthToken} from './utilities.js'

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

function Validator(){
    var signup_form = document.getElementById('signup-form')
    var email = signup_form.elements['email'].value
    var first_name = signup_form.elements['first_name'].value
    var last_name = signup_form.elements['last_name'].value
    var gender = signup_form.elements['gender'].value
    var role = signup_form.elements['role'].value
    var organization = signup_form.elements['organization'].value
    var password = signup_form.elements['password'].value
    var password2 = signup_form.elements['password2'].value
    var terms = document.getElementById('terms').checked

    Assert('.com', 'in', email, 'Please provide a valid email')
    Assert(first_name.length, 'greater_than', 0, 'Please provide your first name')
    Assert(last_name.length, 'greater_than', 0, 'Please provide your last name')
    Assert(gender.length, 'greater_than', 0, "Please select your gender")
    Assert(gender, 'in', ['Male', 'Female'], "Provide a valid gender")

    Assert(role.length, 'greater_than', 0, "Please select your role")
    Assert(role, 'in', ['developer', 'organization'], "Provide a valid role")

    if (role == 'organization'){
        Assert(organization.length, 'greater_than', 0, "Provide your organization name")
    }

    Assert(first_name, 'not_in', password, "Your password should not consist of your first name")
    Assert(last_name, 'not_in', password, "Your password should not consist of your last name")
    Assert(password.length, 'greater_than', 0, 'Please Provide a password')
    Assert(password, 'is', password2, "Your password are not matching")
    Assert(isStrongPassword(newPwd.value), '', '', 'Password must cotain at least one number and one capital letter')
    Assert(hasSpecialCharacter(password), '', '', "Your password must contain a special character like [!@#$%^&*()_+\-[]{};':\"\\|,.<>\/?]")
    Assert(terms, '', '', 'Please agree with the terms and condition')
}


function Verification(){
    var verification_msg = document.createElement('div')
    verification_msg.id = 'verification-msg'

    var verification = document.createElement('p')
    verification.id = 'verification'
    verification.innerText = 'Verification link is on the way!'

    var verification_statement = document.createElement('p')
    verification_statement.id = 'verification-statement'
    verification_statement.innerHTML = "For security reasons, we've sent you an email that <br>contains a link to verify your account."

    var read_docs = document.createElement('a')
    read_docs.id = 'read-docs'
    read_docs.innerText = 'Read FlexiBb Portal Docs'
    read_docs.addEventListener('click', function(){
        Redirect('http://localhost:8000/portal/docs/')
    })

    verification_msg.appendChild(verification)
    verification_msg.appendChild(verification_statement)
    verification_msg.appendChild(read_docs)

    document.getElementsByClassName('signup-section')[0].removeChild(document.getElementById('signup'))
    document.getElementsByClassName('signup-section')[0].appendChild(verification_msg)

}



document.addEventListener("DOMContentLoaded",function(){
    var observer = new IntersectionObserver(onIntersection)
    var content_boxes = document.querySelectorAll('.content-box')
    for(var i=0; i<content_boxes.length; i++){
        var box = content_boxes[i]
        observer.observe(box)
    }


    var gender = document.getElementById('gender-dropdown')
    gender.addEventListener('click', function(){
        var fields = {
            'Male': 'Male',
            'Female': 'Female',
        }
        var gender_value = this.parentElement.querySelector('input')
        var dropdown = new DropDown(gender_value, fields, false, false)
        var dropdown_elements = dropdown.open()
        for(var i=0; i<dropdown_elements.length; i++){
            dropdown_elements[i].addEventListener('click', function(){
                gender_value.value = this.innerText
                CloseDropDown()
            })
        }
    })

    var role = document.getElementById('role-dropdown')
    role.addEventListener('click', function(){
        var fields = {
            'developer': 'developer',
            'organization': 'organization',
        }
        var role_value = this.parentElement.querySelector('input')
        var dropdown = new DropDown(role_value, fields, false, false)
        var dropdown_elements = dropdown.open()
        for(var i=0; i<dropdown_elements.length; i++){
            dropdown_elements[i].addEventListener('click', function(){
                role_value.value = this.innerText
                CloseDropDown()
            })
        }
    })

    var password_toggle = document.getElementById('password-toggle')
    password_toggle.addEventListener('click', function(){
        var thisInput = this.parentElement.querySelector('input')
        passwordToggle(thisInput, this)
    })

    var password2_toggle = document.getElementById('password2-toggle')
    password2_toggle.addEventListener('click', function(){
        var thisInput = this.parentElement.querySelector('input')
        passwordToggle(thisInput, this)
    })

    var signIn = document.getElementById('sign-in');
    signIn.addEventListener('click', function(){
        Redirect('http://localhost:8000/portal/signin/')
    })

    var sign_up = document.getElementById('signup-button')
    sign_up.addEventListener('click', async function(){
        Validator()
        var signup_form = document.getElementById('signup-form')
        var is_developer = (signup_form.elements['role'].value == 'developer')? true : false
        var organization = (signup_form.elements['role'].value == 'organization')? signup_form.elements['organization'].value : ""

        var payload = {
            'email' : signup_form.elements['email'].value,
            'first_name' : signup_form.elements['first_name'].value,
            'last_name' : signup_form.elements['last_name'].value,
            'gender' : signup_form.elements['gender'].value,
            'is_developer' : is_developer,
            'organization' : organization,
            'password' : signup_form.elements['password'].value,
            'password2' : signup_form.elements['password2'].value,
            'accept_term': document.getElementById('terms').checked
        }   

        DeleteAuthToken()

        var endpoint = new Consumer('http://localhost:8000/portal/auth/register/', payload, 'POST', false, true)
        var response = await endpoint.fetch_response()

        var alert = new CustomAlert(response['detail'], '#1d3b77')
        alert.raise()

        Verification()
    })


    //EVENT HANDLER THAT MAKEs POPUP TO DISAPEAR WHEN CLICK OUTSIDE OF IT
    document.addEventListener('click', function(event){
        var role_btn = document.getElementById('role-dropdown')
        var gender_btn = document.getElementById('gender-dropdown')
        try {
            //if the dropdown popup exist
            if(document.getElementById('dropdown')){
                //reference to the dropdown popup
                var dropdown = document.getElementById('dropdown')
                //if the event is not targetted to the dropdown
                if(!dropdown.contains(event.target)){
                    //if the target element is not the filter=key and account 
                    if((event.target !== role_btn) && (event.target !== gender_btn)){
                        //close the dropdown
                        CloseDropDown()
                    }
                }
            }

        } catch (error) {
            return true
        }
    })
})