import {Consumer, CREATE_ElEMENT, onIntersection, COUNTRIES_DETAIL, DropDown, CloseDropDown, GetAuthToken, openPreloadEffect, closePreloadEffect, titleCase, CustomAlert, delay, Assert, Redirect, Reload, ToolTip, hideToolTip} from './utilities.js'
// import { fabric } from './fabrics.js'

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


//////////////////////////////////////////////////////////////////////////////////////////
// HANDLING COUNTRIES
//////////////////////////////////////////////////////////////////////////////////////////
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

function CountryCode(){
    var code = document.getElementById('code')
    code.innerText = countries_details.country_code()
}




//////////////////////////////////////////////////////////////////////////////////////////
// HANDLING AVATAR
//////////////////////////////////////////////////////////////////////////////////////////
const formData = new FormData()
async function UploadAvatar(){
    var url = 'http://localhost:8000/portal/auth/avatar/'
    var options = {
        method: 'POST',
        headers: {
            'Authorization': "Bearer " + GetAuthToken()
        },
        body: formData,
    }
    try {
        openPreloadEffect() //start preload effect
        const response = await fetch(url, options) //consume the endpoint
        const data = await response.json() //get the response data
        if(!response.ok ){
            const key = Object.keys(data)[0]
            throw new Error(data[key]) //throw an error if the status is not 200
        }

        closePreloadEffect() //close the preload effect
        var Succesalert = new CustomAlert(data['detail'], '#1d3b77')
        Succesalert.raise()

        await delay(2000) //give a 2seconds delay
        Reload()
    } catch (error) {
        await delay(2000) //give a 2seconds delay to enhance the preloader
        closePreloadEffect() //close the preload effect

        var customAlert = new CustomAlert(error) //create the alert instance
        customAlert.raise() //raise the alert
        throw new Error(error)
    }
}

async function ShowSelectedAvatar(event){
    const avatar = document.getElementById('avatar')
    const file = event.target.files[0]
    //append the file to the formData
    await new Promise(resolve => setTimeout(resolve, 10))
    formData.append('avatar', file)

    if(file && file.type.startsWith('image/')){
        if(file.size <= (5 * 1024 * 1024)){
            const reader = new FileReader()
            reader.onload = function(e){
                avatar.src = e.target.result
            }
            reader.readAsDataURL(file)
        }else{
            var Erroralert = new CustomAlert('please select an image file less than 5MB.', 'red')
            Erroralert.raise()
        }
    }else{
        var Erroralert = new CustomAlert('please select a valid image file.', 'red')
        Erroralert.raise()
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////------- EDIT AVATAR ---------///////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
let isDragging = false
let positionX, positionY
let PointX, PointY
let Rotation = 0
let Scale = 0

function EditAvatar(){
    var avatar_edit_container = CREATE_ElEMENT('div', {
        'id': 'avatar-edit-container'
    })

    var sub_div = CREATE_ElEMENT('div', {})
    
    var statement = CREATE_ElEMENT('p', {'innerText': 'Edit photo'})

    var selectAvatar = CREATE_ElEMENT('a', {'id':'upload-avatar', 'innerText':'Select'})
    selectAvatar.addEventListener('click', function(){
        document.getElementById('new-avatar').click()
    })

    var cancel_icon = CREATE_ElEMENT('img', {
        'src': '/static/png/cancel.svg',
        'class': 'cancel'
    })
    cancel_icon.addEventListener('click', function(){
        var Elem = document.getElementById('avatar-edit-container')
        document.body.removeChild(Elem)
    })

    statement.appendChild(selectAvatar)
    statement.appendChild(cancel_icon)
    
    var avatar_edit = CREATE_ElEMENT('div', {'id': 'avatar-edit'})

    var new_avatar = CREATE_ElEMENT('input', {'id':'new-avatar'})
    new_avatar.type = 'file'
    new_avatar.style.display = 'none'
    new_avatar.addEventListener('change',async function(event){
        ShowSelectedAvatar(event)
    })

    var avatar = CREATE_ElEMENT('img', {
        'src': document.getElementById('user-avatar').value,
        'id': 'avatar'
    })
    
    var drag_selection = CREATE_ElEMENT('div', {'id': 'drag-selection'})
    drag_selection.id = 'drag-selection'

    avatar_edit.appendChild(avatar)
    avatar_edit.appendChild(new_avatar)
    avatar_edit.appendChild(drag_selection)
    
    var control = CREATE_ElEMENT('div', {'id': 'control'})
    
    var zoom = CREATE_ElEMENT('div', {'id': 'zoom'})
    
    var zoom_out = CREATE_ElEMENT('img', {
        'src': '/static/png/zoom-out.svg',
        'alt': "zoom out"
    })
    zoom_out.addEventListener('mouseover', function(){
        ToolTip(this, 'zoom out')
    })
    zoom_out.addEventListener('mouseout', hideToolTip)
    
    var zoomer = document.createElement('input')
    zoomer.type = 'range'
    zoomer.min = '100'
    zoomer.max = '250'
    zoomer.value = '0'
    zoomer.id = 'zoomer'
    
    var zoom_in = CREATE_ElEMENT('img', {
        'src': '/static/png/zoom-in.svg',
        'alt': "zoom in"
    })
    zoom_in.addEventListener('mouseover', function(){
        ToolTip(this, 'zoom in')
    })
    zoom_in.addEventListener('mouseout', hideToolTip)

    zoom.appendChild(zoom_out)
    zoom.appendChild(zoomer)
    zoom.appendChild(zoom_in)
    
    var rotate_left = CREATE_ElEMENT('img', {
        'src': '/static/png/rotate-left.svg',
        'alt': 'rotate-left'
    })
    rotate_left.addEventListener('mouseover', function(){
        ToolTip(this, 'anticlockwise')
    })
    rotate_left.addEventListener('mouseout', hideToolTip)
    
    var rotate_right = CREATE_ElEMENT('img', {
        'src': '/static/png/rotate-right.svg',
        'alt': 'rotate-right'
    })
    rotate_right.addEventListener('mouseover', function(){
        ToolTip(this, 'clockwise')
    })
    rotate_right.addEventListener('mouseout', hideToolTip)

    var save = CREATE_ElEMENT('a', {'innerText': 'Save'})
    save.addEventListener('click', function(){
        UploadAvatar()
    })
    
    control.appendChild(zoom)
    control.appendChild(rotate_left)
    control.appendChild(rotate_right)
    control.appendChild(save)

    sub_div.appendChild(statement)
    sub_div.appendChild(avatar_edit)
    sub_div.appendChild(control)

    avatar_edit_container.appendChild(sub_div)
    document.body.appendChild(avatar_edit_container)
}


function SkillManager(skill_to_remove){
    this.skill_to_remove = skill_to_remove.trim()

    var new_skill_value = document.getElementById('new-skill-value')
    const add_skill_btn = document.getElementById('add-skill-btn')
    const skill_value = document.getElementById('skill-value')
    const skill_list = document.getElementById("skills-list")

    this.add_skill = function(){
        if(new_skill_value.value != ''){
            if(new_skill_value.value == ''){
                skill_value.value = new_skill_value.value
            }else{
                skill_value.value = skill_value.value + ',' + new_skill_value.value
            }
            var skill_elem = CREATE_ElEMENT('p', {'id': 'skill'})
            skill_elem.innerText = new_skill_value.value
            var remove_icon = CREATE_ElEMENT('img', {'class': 'remove-skill', 'src': '/static/png/cancel_white.svg'})
            remove_icon.addEventListener('click', function(){
                let skill_parent = this.parentElement
                let skill_container = skill_parent.parentElement

                var skill_manager = new SkillManager(skill_parent.innerText)
                skill_manager.remove_skill()

                skill_container.removeChild(skill_parent)
            })
            skill_elem.appendChild(remove_icon)
            skill_list.appendChild(skill_elem)

            new_skill_value.value = ''

            add_skill_btn.style.opacity = 0.5
            
            skill_value.dispatchEvent(new Event('input'))
        }
    }

    this.remove_skill = function(){
        let new_skill = ""
        if(skill_value.value.indexOf(',') != -1){
            let split_skills =  skill_value.value.split(',')
            for(var i=0; i<split_skills.length; i++){
                if(split_skills[i].trim() == this.skill_to_remove){
                    continue
                }else{
                    if(new_skill == ""){
                        new_skill += split_skills[i]
                    }else{
                        new_skill += ',' + split_skills[i]
                    }
                }
            }
        }
        skill_value.value = new_skill
        skill_value.dispatchEvent(new Event('input'))
    }
}


const country = document.getElementById('country')
const phone = document.getElementById('phone')
const website = document.getElementById('website')
const github = document.getElementById('github')
const linkedIn = document.getElementById('linkedIn')
const twitter = document.getElementById('twitter')  
const stackoverflow = document.getElementById('stackoverflow')
const first_name = document.getElementById('first_name')
const last_name = document.getElementById('last_name')   
const gender = document.getElementById('gender')
const bio = document.getElementById('bio')  
const skills = document.getElementById('skill-value')

function loadUserData(){
    this.url = 'http://localhost:8000/portal/auth/details/'
    this.data;

    this.load = async function(){
        var endpoint = new Consumer('http://localhost:8000/portal/auth/details/', {}, 'GET', false, true)
        var response = await endpoint.fetch_response()

        this.data = response
    }

    this.changes_made = function(){
        let status = false
        if(Assert(country.value.trim(), 'is_not', this.data['country'].trim(), '')){
            status = true
            return status
        }
        if(Assert(phone.value.trim(), 'is_not', this.data['phone'].trim(), '')){
            status = true
            return status
        }
        if(Assert(website.value.trim(), 'is_not', this.data['website'].trim(), '')){
            status = true
            return status
        }
        if(Assert(github.value.trim(), 'is_not', this.data['github'].trim(), '')){
            status = true
            return status
        }
        if(Assert(linkedIn.value.trim(), 'is_not', this.data['linkedIn'].trim(), '')){
            status = true
            return status
        }
        if(Assert(twitter.value.trim(), 'is_not', this.data['twitter'].trim(), '')){
            status = true
            return status
        }
        if(Assert(stackoverflow.value.trim(), 'is_not', this.data['stackoverflow'].trim(), '')){
            status = true
        }
        if(Assert(first_name.value.trim(), 'is_not', this.data['first_name'].trim(), '')){
            status = true
            return status
        }
        if(Assert(last_name.value.trim(), 'is_not', this.data['last_name'].trim(), '')){
            status = true
            return status
        }
        if(Assert(gender.value.trim(), 'is_not', this.data['gender'].trim(), '')){
            status = true
            return status
        }
        if(Assert(bio.value.trim(), 'is_not', this.data['bio'].trim(), '')){
            status = true
            return status
        }
        if(Assert(skills.value.trim(), 'is_not', this.data['skills'].trim(), '')){
            status = true
            return status
        }

        return status
    }

    this.update = async function(){
        var payload = {
            'email': this.data['email'],
            'username': this.data['username'],
            'country': country.value.trim(),
            'phone': phone.value.trim(),
            'website': website.value.trim(),
            'github': github.value.trim(),
            'linkedIn': linkedIn.value.trim(),
            'twitter': twitter.value.trim(),
            'stackoverflow': stackoverflow.value.trim(),
            'first_name': first_name.value.trim(),
            'last_name': last_name.value.trim(),
            'gender': gender.value.trim(),
            'bio': bio.value.trim(),
            'skills':skills.value.trim()
        }
        var endpoint = new Consumer('http://localhost:8000/portal/auth/details/', payload, 'PATCH', true, true)
        var response = await endpoint.fetch_response()

        this.data = response
        alert(JSON.stringify(response))
    }

    this.discard = function(){
        country.value = this.data['country']
        phone.value = this.data['phone']
        website.value = this.data['website']
        github.value = this.data['github']
        linkedIn.value = this.data['linkedIn']
        twitter.value = this.data['twitter']
        stackoverflow.value = this.data['stackoverflow']
        first_name.value = this.data['first_name']
        last_name.value = this.data['last_name']
        gender.value = this.data['gender']
        bio.value = this.data['bio']
    }
}

var InitateUserData = new loadUserData()
let has_listener = false
function permitSaveOrDiscard(){
    var save = document.getElementById('save')
    var discard = document.getElementById('discard')
    if(InitateUserData.changes_made()){
        save.style.opacity = 1
        discard.style.opacity = 1
        if (has_listener == false){
            save.addEventListener('click', function(){
                InitateUserData.update()
            })
    
            discard.addEventListener('click', function(){
                InitateUserData.discard()
            })
            has_listener = true
        }

    }else{
        save.style.opacity = 0.7
        discard.style.opacity = 0.7
        if (has_listener == true){
            save.removeEventListener('click',function(){
                InitateUserData.update()
            })
    
            discard.removeEventListener('click', function(){
                InitateUserData.discard()
            })
        }
    }
}

function loadEventHandler(){
    country.addEventListener('input', function(){
        permitSaveOrDiscard()
    })
    phone.addEventListener('input', function(){
        permitSaveOrDiscard()
    })
    website.addEventListener('input', function(){
        permitSaveOrDiscard()
    })
    github.addEventListener('input', function(){
        permitSaveOrDiscard()
    })
    linkedIn.addEventListener('input', function(){
        permitSaveOrDiscard()
    })
    twitter.addEventListener('input', function(){
        permitSaveOrDiscard()
    })
    stackoverflow.addEventListener('input', function(){
        permitSaveOrDiscard()
    })
    first_name.addEventListener('input', function(){
        permitSaveOrDiscard()
    })
    last_name.addEventListener('input', function(){
        permitSaveOrDiscard()
    })
    gender.addEventListener('input', function(){
        permitSaveOrDiscard()
    })
    bio.addEventListener('input', function(){
        permitSaveOrDiscard()
    })
    skills.addEventListener('input', function(){
        permitSaveOrDiscard()
    })
}

function pageIndicator(){
    var pageid = document.getElementById('page')
    var focus = document.getElementById(pageid.value)
    focus.style.backgroundColor = '#2853A8'
    focus.style.color = '#fff'
    focus.style.opacity ='1'
}



document.addEventListener("DOMContentLoaded",async function(){
    var observer = new IntersectionObserver(onIntersection)
    var content_boxes = document.querySelectorAll('.content-box')
    for(var i=0; i<content_boxes.length; i++){
        var box = content_boxes[i]
        observer.observe(box)
    }

    pageIndicator()

    await LoadCountries()

    if(document.getElementById('discard')){
        await InitateUserData.load()
        await loadEventHandler()
    }

    var my_profile = document.getElementById('my-profile')
    my_profile.addEventListener('click', function(){
        Redirect('http://localhost:8000/portal/profile/')
    })

    var edit_profile = document.getElementById('edit-profile')
    edit_profile.addEventListener('click', function(){
        Redirect('http://localhost:8000/portal/edit-profile/')
    })

    var security = document.getElementById('security')
    security.addEventListener('click', function(){
        Redirect('http://localhost:8000/portal/security/')
    })

    var databases = document.getElementById('databases')
    databases.addEventListener('click', function(){
        Redirect('http://localhost:8000/portal/databases/')
    })

    var data_export = document.getElementById('data-export')
    data_export.addEventListener('click', function(){
        Redirect('http://localhost:8000/portal/security/')
    })

    var delete_account = document.getElementById('delete-account')
    delete_account.addEventListener('click', function(){
        Redirect('http://localhost:8000/portal/security/')
    })

    if(document.getElementById('current_flag')){
        var current_flag = document.getElementById('current_flag')
        let country_value = current_flag.parentElement.innerText
        countries_details.country = country_value
        current_flag.src = countries_details.flag()

        CountryCode()
    }

    if(document.getElementById('edit-current-flag')){
        var current_flag = document.getElementById('edit-current-flag')
        let country_value = current_flag.parentElement.querySelector('input').value
        countries_details.country = country_value

        current_flag.src = countries_details.flag()
    }

    if(document.getElementById('code')){
        var country_code = document.getElementById('code')
        country_code.innerText = countries_details.country_code()
    }

    if(document.getElementById('country-dropdown')){
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
                    current_flag.src = countries_details.flag()
                    CountryCode()

                    country_value.dispatchEvent(new Event('input'))
                })
            }
        })
    }

    if(document.getElementById('new-skill-value')){
        var add_skill_btn = document.getElementById('add-skill-btn')
        var new_skill_value = document.getElementById('new-skill-value')
        new_skill_value.addEventListener('input', function(){
            if(this.value == ''){
                add_skill_btn.style.opacity = 0.5
            }else{
                add_skill_btn.style.opacity = 1
            }
        })

        add_skill_btn.addEventListener('click', function(){
            var skillmanager = new SkillManager('')
            skillmanager.add_skill()
        })

        var remove_skill = document.getElementsByClassName('remove-skill')
        for(var i=0; i<remove_skill.length; i++){
            remove_skill[i].addEventListener('click', function(){
                let skill_parent = this.parentElement
                let skill_container = skill_parent.parentElement

                var skill_manager = new SkillManager(skill_parent.innerText)
                skill_manager.remove_skill()

                skill_container.removeChild(skill_parent)
            })
        }
    }

    var edit_avatar = document.getElementById('edit-avatar')
    edit_avatar.addEventListener('click', function(){
        EditAvatar()
    })
    edit_avatar.addEventListener('mouseover', function(){
        ToolTip(this, 'edit avatar')
    })
    edit_avatar.addEventListener('mouseout', hideToolTip)

})