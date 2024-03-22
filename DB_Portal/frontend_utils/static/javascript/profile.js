import {Consumer, CREATE_ElEMENT,onIntersection,COUNTRIES_DETAIL, DropDown,CloseDropDown, titleCase, CustomAlert, delay, get_queryparams, Assert, Redirect} from './utilities.js'

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


///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////------- COGENT FUNCTIONS ---------///////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
function AddSkill(elem){
    var parentElem = document.getElementById("skills-list")
    var newSkill = CREATE_ElEMENT('p', {'innerText': elem.value})
    var removeImg = CREATE_ElEMENT('img', {'src': '/static/png/cancel_white.svg'})

    newSkill.appendChild(removeImg)
    parentElem.appendChild(newSkill)
}

function RemoveSkill(elem){
    var parentElem = elem.parentElement()
    var parentElemContainer = parentElem.parentElement
    parentElemContainer.removeChild(parentElem)
}

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

    var cancel_icon = CREATE_ElEMENT('img', {
        'src': '/static/png/cancel.svg',
        'class': 'cancel'
    })
    cancel_icon.addEventListener('click', function(){
        var Elem = document.getElementById('avatar-edit-container')
        document.body.removeChild(Elem)
    })

    statement.appendChild(cancel_icon)
    
    var avatar_edit = CREATE_ElEMENT('div', {'id': 'avatar-edit'})

    var avatar = CREATE_ElEMENT('img', {
        'src': '/static/png/collins.jpeg',
        'id': 'avatar'
    })
    avatar.addEventListener('mousedown', function(event){
        isDragging = true
        positionX = event.clientX
        positionY = event.clientY
        //alert(positionX + ',' + positionY)
    })
    
    var drag_selection = CREATE_ElEMENT('div', {'id': 'drag-selection'})
    drag_selection.id = 'drag-selection'

    avatar_edit.appendChild(avatar)
    avatar_edit.appendChild(drag_selection)
    
    var control = CREATE_ElEMENT('div', {'id': 'control'})
    
    var zoom = CREATE_ElEMENT('div', {'id': 'zoom'})
    zoom.addEventListener('click', function(){
        var avatar = document.getElementById('avatar')
        Scale = this.value
        avatar.style.transform = 'scale(' +(Scale/100)+') ' + 'rotate(' +Rotation+'deg) ' +'translate(' + PointX + 'px ,' + PointY +'px)'
    })
    
    var zoom_out = CREATE_ElEMENT('img', {
        'src': '/static/png/zoom-out.svg',
        'alt': "zoom out"
    })
    
    var zoomer = document.createElement('input')
    zoomer.type = 'range'
    zoomer.min = '100'
    zoomer.max = '180'
    zoomer.value = '0'
    zoomer.id = 'zoomer'
    
    var zoom_in = CREATE_ElEMENT('img', {
        'src': '/static/png/zoom-in.svg',
        'alt': "zoom in"
    })

    zoom.appendChild(zoom_out)
    zoom.appendChild(zoomer)
    zoom.appendChild(zoom_in)
    
    var rotate_left = CREATE_ElEMENT('img', {
        'src': '/static/png/rotate-left.svg',
        'alt': 'rotate-left'
    })
    
    var rotate_right = CREATE_ElEMENT('img', {
        'src': '/static/png/rotate-right.svg',
        'alt': 'rotate-right'
    })

    var save = CREATE_ElEMENT('a', {'innerText': 'Save'})
    
    control.appendChild(zoom)
    control.appendChild(rotate_left)
    control.appendChild(rotate_right)
    control.appendChild(save)

    sub_div.appendChild(statement)
    sub_div.appendChild(avatar_edit)
    sub_div.appendChild(control)

    avatar_edit_container.appendChild(sub_div)
    document.body.appendChild(avatar_edit_container)

    avatar.addEventListener('mousedown', function(event){
        isDragging = true
        positionX = event.clientX
        positionY = event.clientY
        //alert(positionX + ',' + positionY)
    })

    document.addEventListener('mouseup', function(){
        isDragging = false
    })

    document.addEventListener('mousemove', function(event){
        if (document.getElementById('avatar')){
            var avatar = document.getElementById('avatar')
            if(isDragging == true){
                PointX = event.clientX - positionX
                PointY = event.clientY - positionY
                //alert('scale(' +(Scale/100)+') ' + 'rotate(' +Rotation+'deg) ' +'translate(' + PointX + 'px ,' + PointY +'px)')
                avatar.style.transform = 'scale(' +(Scale/100)+') ' + 'rotate(' +Rotation+'deg) ' +'translate(' + PointX + 'px ,' + PointY +'px)'
                // avatar.style.top = (avatar.offsetTop + deltaY )+'px'
                // avatar.style.left = (avatar.offsetLeft + deltaX )+'px'
            }
        }
    })

    zoomer.addEventListener('change', function(event){
        var avatar = document.getElementById('avatar')
        Scale = this.value

        avatar.style.transform = 'scale(' +(Scale/100)+') ' + 'rotate(' +Rotation+'deg) ' +'translate(' + PointX + 'px ,' + PointY +'px)'
    })
}

document.addEventListener("DOMContentLoaded",async function(){
    var observer = new IntersectionObserver(onIntersection)
    var content_boxes = document.querySelectorAll('.content-box')
    for(var i=0; i<content_boxes.length; i++){
        var box = content_boxes[i]
        observer.observe(box)
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

    await LoadCountries()

    if(document.getElementById('current_flag')){
        var current_flag = document.getElementById('current_flag')
        let country_value = current_flag.parentElement.innerText
        countries_details.country = country_value
        current_flag.src = countries_details.flag()
    }

    if(document.getElementById('edit-current-flag')){
        var current_flag = document.getElementById('edit-current-flag')
        let country_value = current_flag.parentElement.querySelector('input').value
        countries_details.country = country_value
        
        current_flag.src = countries_details.flag()
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
                })
            }
        })
    }

    var edit_avatar = document.getElementById('edit-avatar')
    edit_avatar.addEventListener('click', function(){
        EditAvatar()
    })

    // var avatar = document.getElementById('avatar')
    // var dragselection = document.getElementById('drag-selection')

    // avatar.addEventListener('mousedown', function(event){
    //     isDragging = true
    //     positionX = event.clientX
    //     positionY = event.clientY
    //     //alert(positionX + ',' + positionY)
    // })

    // document.addEventListener('mouseup', function(){
    //     isDragging = false
    // })

    // document.addEventListener('mousemove', function(event){
    //     if (document.getElementById('avatar')){
    //         var avatar = document.getElementById('avatar')
    //         if(isDragging == true){
    //             PointX = event.clientX - positionX
    //             PointY = event.clientY - positionY
    //             //alert('scale(' +(Scale/100)+') ' + 'rotate(' +Rotation+'deg) ' +'translate(' + PointX + 'px ,' + PointY +'px)')
    //             avatar.style.transform = 'scale(' +(Scale/100)+') ' + 'rotate(' +Rotation+'deg) ' +'translate(' + PointX + 'px ,' + PointY +'px)'
    //             // avatar.style.top = (avatar.offsetTop + deltaY )+'px'
    //             // avatar.style.left = (avatar.offsetLeft + deltaX )+'px'
    //         }
    //     }
    // })

    // var zoomer = document.getElementById('zoomer')
    // zoomer.addEventListener('change', function(event){
    //     var avatar = document.getElementById('avatar')
    //     Scale = this.value

    //     avatar.style.transform = 'scale(' +(Scale/100)+') ' + 'rotate(' +Rotation+'deg) ' +'translate(' + PointX + 'px ,' + PointY +'px)'
    // })
})