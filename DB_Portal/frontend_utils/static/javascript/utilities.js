function searchFilter(value){
    var key_box = document.getElementById('filter-key')
    key_box.innerText = value
}

///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////++++ DropDown Function +++++++////////////////////////////
export function CloseDropDown(){
    if(document.getElementById('dropdown')){
        var DropDown = document.getElementById('dropdown')
        document.body.removeChild(DropDown)
    }
}

export function DropDown(elem, fields, image, search_filter){
    this.elem = elem;
    this.fields = fields || {};
    this.image = image || false;
    this.search_filter = search_filter || false;

    var coordinate = this.elem.getBoundingClientRect()
    
    this.open = function(){
        try {
            var dropdown = document.getElementById('dropdown')
            document.body.removeChild(dropdown)
            
        } catch (error) {
            var DropDown = document.createElement('div')
            DropDown.id = 'dropdown'

            var DropDownList = document.createElement('ul')
            DropDownList.id = 'dropdown-list'
            
            for(var key in this.fields){
                var value = this.fields[key];
                var List = document.createElement('li')
                List.id = key

                if(this.image == true){
                    var Icon = document.createElement('img')
                    Icon.src = "/static/png/" + key + ".svg"
                    List.appendChild(Icon)
                }

                var Anchor = document.createElement('a')
                Anchor.innerHTML = key

                if(this.search_filter == false){
                    Anchor.href = '/' + value
                }else{
                    Anchor.addEventListener('click', function(){
                        var filter_key = document.getElementById('filter-key')
                        filter_key.innerText = this.innerText
                        CloseDropDown()
                    })
                }

                List.appendChild(Anchor)
                DropDownList.appendChild(List)
            }

            DropDown.appendChild(DropDownList)
            document.body.appendChild(DropDown)
            
            DropDown.style.left = coordinate.left - (DropDown.clientWidth/2) + (this.elem.clientWidth/2) + "px"
            DropDown.style.top =  coordinate.top + (this.elem.clientHeight) + "px"
        }
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////++++ CustomAlert Function +++++++////////////////////////////
export function CustomAlert(message, color){
    this.message = message || ''
    this.color = color || 'red'

    this.raise = function(){
        var box = document.createElement('div')
        box.id = 'alert'
        box.style.backgroundColor = this.color

        var message = document.createElement('p')
        message.id = 'alertMessage'
        message.innerText = this.message

        box.appendChild(message)
        document.body.appendChild(box)

        setTimeout(this.close, 4000)
    }

    this.close = function(){
        document.body.removeChild(document.getElementById('alert'))
    }
}



///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////++++ Assertion Function +++++++////////////////////////////
export function Assert(subject, verb, object, message){

    if (verb == 'is'){
        if (subject == object){
            return true
        }
    }

    if(verb == 'is_not'){
        if (subject !== object){
            return true
        }
    }

    var customAlert = new CustomAlert(message)
    customAlert.raise()
}


///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////++++ AuthToken Function +++++++////////////////////////////
export function SetAuthToken(token){
    document.cookie = 'authToken=' + token + ';path=/;'
}


export function GetAuthToken(){
    const cookies = document.cookie.split(';')
    var check, authToken;
    for(var i=0; i<cookies.length; i++){
        if(cookies[i].includes('authToken')){
            authToken = cookies[i].split('=');
            authToken = authToken[1]
            check=true
            break;
        }else{
            check=false
            continue;
        }
    }

    Assert(check, 'is', true, 'Please Login')
    return authToken
}

export function DeleteAuthToken(){
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}




///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////++++ Delay function +++++++////////////////////////////
export function delay(ms){
    return new Promise(function(resolve){
        setTimeout(resolve, ms)
    });
}




///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////++++ Endpoint Consumer function +++++++////////////////////////////
export function Consumer(url, payload, method, authenticate, preload, parent){
    this.url = url || ''
    this.payload = payload || {}
    this.method = method
    this.authenticte = authenticate || true
    this.preload = preload || false
    this.parent = document.getElementById(parent) || document.body
    
    this.csrf_token = document.querySelector('input[name=csrfmiddlewaretoken]').value
    this.headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': this.csrf_token,
    }

    if (authenticate == true){
         this.headers['Authorization'] = "Bearer " + GetAuthToken()
    }

    this.options = {
        method:  this.method,
        headers: this.headers,
    };

    if (this.method !== 'GET'){
        this.options['body'] = JSON.stringify(this.payload)
    }
    
    this.fetch_response = async function(){
        try {
            if (this.preload == true){
                this.show_effect() //start the preload effect
            }
            const response = await fetch(this.url, this.options) //consume the endpoint
            const data = await response.json() //get the response data
            if(!response.ok){
                throw new Error(data.detail) //throw an error if the status is not 200
            }
            this.close_effect() //close the preload effect
            return data //return the response data
            
        } catch (error) {
            if (this.preload == true){
                await delay(2000) //give a 2seconds delay to enhance the preloader
                this.close_effect() //close the preload effect
            }
            var customAlert = new CustomAlert(error) //create the alert instance
            customAlert.raise(error.detail) //raise the alert
        }
    }

    this.show_effect = function(){
        var preloader = document.createElement('div')
        preloader.id ='preloader'
        var img = document.createElement('img')
        img.src = '/static/png/preloader.svg'
        
        preloader.appendChild(img)
        this.parent.appendChild(preloader)
    }

    this.close_effect = function(){
        if(document.getElementById('preloader')){
            document.getElementById('preloader').remove()
        }
    }
}



///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////++++ Search Function +++++++////////////////////////////
export function Search(key, value, url){
    this.key = key || 'username'
    this.value = value || ''
    this.url = url + '?key=' + this.key + '&' + 'value=' + this.value

    this.search = async function(){
        var consumer = new Consumer(this.url, {}, 'GET', true, false)
        var data = await consumer.fetch_response()
        return data
    }
}


export function SearchHistoryManager(username){
    this.username = username || ''
    this.keyword = 'searchhistory'
    this.new_history = ''

    this.history_exist = function(){
        if(document.cookie.includes(this.keyword)){
            var COOKIES = document.cookie.split(';')
            for(var i=0; i<COOKIES.length; i++){
                if(COOKIES[i].includes(this.keyword)){
                    var history = COOKIES[i].split('=')[1]
                    if(history == ""){
                        return false
                    }
                    break
                }
            }
            return true
        }
        return false
    }

    this.fetch_history = function(){
        if(document.cookie.includes(this.keyword)){
            var COOKIES = document.cookie.split(';')
            var history;
            for(var i=0; i<COOKIES.length; i++){
                if(COOKIES[i].includes(this.keyword)){
                    history = COOKIES[i].split('=')[1]
                    break;
                }else{
                    continue;
                }
            }
            return history

        }else{
            document.cookie = this.keyword +"=" + ';path=/';
            return ""
        }
        
    }

    this.process_history = function(){
        var history = this.fetch_history().split('&')
        var new_history = ""
        for(var i=0; i<history.length; i++){
            if(history[i] == this.username){
                continue
            }else{
                if(i == (history.length - 1)){
                    new_history += history[i]
                }else{
                    new_history += (history[i] + "&")
                }
            }
        }
        this.new_history = new_history
    }

    this.add_to_history = function(){
        this.process_history()
        document.cookie = this.keyword + "=" + this.new_history  + "&" + this.username + ';path=/';
    }

    this.remove_from_history = function(){
        this.process_history()
        document.cookie = this.keyword + "=" + this.new_history + ';path=/';
    }

    this.history_list = function(){
        this.process_history()
        var history = this.new_history.split('&')
        var history_list = []
        for(var i=0; i<history.length; i++){
            history_list = history_list.concat(history[i])
        }
        return history_list
    }
}





///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////++++ Redirect function +++++++////////////////////////////
export function Redirect(url){
    window.location.href = url
}



///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////++++ Quick Link function +++++++////////////////////////////
export async function ToolTip(elem, text){
    var coordinate = elem.getBoundingClientRect()

    var tip = document.createElement('p')
    tip.innerText = text
    tip.id = 'tool-tip'
    tip.style.top = coordinate.top + elem.clientHeight + 'px'
    
    await delay(300)

    document.body.appendChild(tip)
    tip.style.left = coordinate.left - (tip.clientWidth/2) + (elem.clientWidth/2) + 'px'
}

export async function hideToolTip(){
    await delay(300)
    if(document.getElementById('tool-tip')){
        var tip = document.getElementById('tool-tip')
        document.body.removeChild(tip)
    }
}




///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////++++ queryparameter function +++++++////////////////////////////
export function get_queryparams(KEY){
    try {
        // get the current url
        var currentUrl = location.href
        // split the url at point of '?'
        var queryparams = currentUrl.split('?')[1]
        // split at the point '&'
        queryparams = queryparams.split('&')
        
        // create an empty dict
        var queryparams_dict = {}

        for(var i=0; i<queryparams.length; i++){
            var key = queryparams[i].split('=')[0]
            var value = queryparams[i].split('=')[1]
            queryparams_dict[key] = value
        }
        
        if(queryparams_dict[KEY]){
            return queryparams_dict[KEY]
        }else{
            return null
        }
    } catch (error) {
        return null   
    }
}



export function slugify_username(username){
    var broken = username.split('_')
    var slugified = ""
    for(var i=0; i<broken.length; i++){
        if(i == (broken.length - 1)){
            slugified +=  broken[i].toLowerCase()
        }else{
            slugified +=  broken[i].toLowerCase() + '-'
        }
    } 
    return slugified
}