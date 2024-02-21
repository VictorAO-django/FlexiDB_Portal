///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////++++ DropDown Function +++++++////////////////////////////
export function DropDown(elemId, fields, image, search_filter){
    this.elemId = elemId || '';
    this.fields = fields || {};
    this.image = image || false;
    this.search_filter = search_filter || false;

    var elem = document.getElementsByClassName(this.elemId)[0]
    var rect = elem.getBoundingClientRect()
    this.center = rect.left + (elem.clientWidth/2)
    this.top = rect.top + (elem.clientHeight/2) + 5
    
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
                Anchor.href = '/' + value
                if(this.search_filter == true){
                    Anchor.href = "javascript:searchFilter('" + value + "')"
                }
                Anchor.innerHTML = key

                List.appendChild(Anchor)
                DropDownList.appendChild(List)
            }
            DropDown.appendChild(DropDownList)
            document.body.appendChild(DropDown)

            DropDown.style.left = (this.center - (DropDown.clientWidth/2)) + "px"
            DropDown.style.top = this.top + "px"
        }
    }
}

export function CloseDropDown(){
    var DropDown = document.getElementById('dropdown')
    document.body.removeChild(DropDown)
}

export function Search(key, value){
    this.key = key || 'username'
    this.value = value || ''
}


///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////++++ CustomAlert Function +++++++////////////////////////////
function CustomAlert(message, color){
    this.message = message || ''
    this.color = color || 'red'

    this.raise = function(){
        var box = document.createElement('div')
        box.id = 'alert'
        box.style.color = this.color

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
function SetAuthToken(token){
    document.cookie = 'authToken=' + token
}

function GetAuthToken(){
    const cookies = document.cookie.split(';')
    var check, authToken;
    for(var i=0; i<=cookies.length; i++){
        if(cookies[i].startsWith('authToken=')){
            authToken = cookies[i];
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



///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////++++ Endpoint Consumer function +++++++////////////////////////////
export function Consumer(url, payload, method, authenticate){
    this.url = url || ''
    this.payload = payload || {}
    this.method = method
    this.authenticte = authenticate || true

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
        body: JSON.stringify(this.payload),
    };

    
    this.fetch_response = async function(){
        await fetch(this.url, this.options)
            .then(response => {
                return response.json()
            })
            .then(data => {
                return data
            })
            .catch(error => {
                alert(error.message)
                var customAlert = new CustomAlert(data['message'])
                customAlert.raise()
            })

    }
}