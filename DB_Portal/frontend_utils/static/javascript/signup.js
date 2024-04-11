import {DropDown,onIntersection, COUNTRIES_DETAIL, hasSpecialCharacter, isStrongPassword, passwordToggle, CloseDropDown, Consumer, Assert, Redirect, CustomAlert, DeleteAuthToken} from './utilities.js'

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

var countries_details;
async function LoadCountries(){
    var url = 'https://restcountries.com/v3.1/all?fields=name,flags,idd'
    var data;
    try {
        const cache = await caches.open('countries-detail-cache')
        const cachedResponse = await cache.match(url)
        if(cachedResponse){
            data = await cachedResponse.json()
        }else{
            var response = new Consumer(url, {}, 'GET', false, false)
            data = await response.fetchResponse()
            await cache.put(url, data)
            data = data.json()
        }
        countries_details = new COUNTRIES_DETAIL(data)

    } catch (error) {
        alert(error)
    }
}

function Validator(){
    var signup_form = document.getElementById('signup-form')
    var email = signup_form.elements['email']
    var first_name = signup_form.elements['first_name']
    var last_name = signup_form.elements['last_name']
    var gender = signup_form.elements['gender']
    var country = signup_form.elements['country']
    var role = signup_form.elements['role']
    var organization = signup_form.elements['organization']
    var password = signup_form.elements['password']
    var password2 = signup_form.elements['password2']
    var terms = document.getElementById('terms')

    Assert('.com', 'in', email.value, 'Please provide a valid email')
    Assert(first_name.value, 'is_not', '', 'Please provide your first name')
    Assert(last_name.value, 'is_not', '', 'Please provide your last name')
    Assert(gender.value, 'is_not', '', "Please select your gender")
    Assert(gender.value, 'in', ['Male', 'Female'], "Provide a valid gender")

    Assert(country.value, 'is_not', '', "Please select your country")
    //alert(Object.keys(countries_details.countries_dict()))
    Assert(country.value, 'in', Object.keys(countries_details.countries_dict()), "Country does not exist")
    Assert(role.value, 'is_not', '', "Please select your role")
    Assert(role.value, 'in', ['developer', 'organization'], "Provide a valid role")

    if (role.value == 'organization'){
        Assert(organization.value, 'is_not', '', "Provide your organization name")
    }

    Assert(first_name.value, 'not_in', password.value, "Your password should not consist of your first name")
    Assert(last_name.value, 'not_in', password.value, "Your password should not consist of your last name")
    Assert(password.value, 'is_not', '', 'Please Provide a password')
    Assert(password.value, 'is', password2.value, "Your password are not matching")
    Assert(isStrongPassword(password.value), '', '', 'Password must cotain at least one number and one capital letter')
    Assert(hasSpecialCharacter(password.value), '', '', "Your password must contain a special character like [!@#$%^&*()_+\-[]{};':\"\\|,.<>\/?]")
    Assert(terms.checked, '', '', 'Please agree with the terms and condition')
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


document.addEventListener("DOMContentLoaded",async function(){
    var observer = new IntersectionObserver(onIntersection)
    var content_boxes = document.querySelectorAll('.content-box')
    for(var i=0; i<content_boxes.length; i++){
        var box = content_boxes[i]
        observer.observe(box)
    }

    await LoadCountries()

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
            'country' : signup_form.elements['country'].value,
            'is_developer' : is_developer,
            'organization' : organization,
            'password' : signup_form.elements['password'].value,
            'password2' : signup_form.elements['password2'].value,
            'accept_term': document.getElementById('terms').checked
        }   

        DeleteAuthToken()

        var endpoint = new Consumer('http://localhost:8000/portal/auth/register/', payload, 'POST', false, true)
        var response = await endpoint.fetch_response()

        var success = new CustomAlert(response['detail'], '#1d3b77')
        success.raise()

        Verification()
    })


    var country_dropdown = document.getElementById('country-dropdown')
    country_dropdown.addEventListener('click', function(){
        var fields = countries_details.countries_dict()
        var country_value = this.parentElement.querySelector('input')
            
        var dropdown = new DropDown(this.parentElement, fields, false, false)
        var dropdown_elements = dropdown.open()
         for(var i=0; i<dropdown_elements.length; i++){
            dropdown_elements[i].addEventListener('click', function(){
                country_value.value = this.innerText
                CloseDropDown()
                countries_details.country = this.innerText
            })
        }
    })


    //EVENT HANDLER THAT MAKEs POPUP TO DISAPEAR WHEN CLICK OUTSIDE OF IT
    document.addEventListener('click', function(event){
        var role_btn = document.getElementById('role-dropdown')
        var gender_btn = document.getElementById('gender-dropdown')
        var country_btn = document.getElementById('country-dropdown')
        try {
            //if the dropdown popup exist
            if(document.getElementById('dropdown')){
                //reference to the dropdown popup
                var dropdown = document.getElementById('dropdown')
                //if the event is not targetted to the dropdown
                if(!dropdown.contains(event.target)){
                    //if the target element is not the filter=key and account 
                    if((event.target !== role_btn) && (event.target !== gender_btn) && (event.target !== country_btn)){
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