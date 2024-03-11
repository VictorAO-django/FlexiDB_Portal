import {
    DropDown, 
    CloseDropDown, 
    Search, 
    Redirect, 
    delay, 
    get_queryparams,
    SearchHistoryManager, 
    Consumer,
    CustomAlert,
    DeleteAuthToken,
    ToolTip,
    hideToolTip, 
    slugify_username,
} from './utilities.js'

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


function SearchBox(elem, data){
    var coordinate = elem.getBoundingClientRect()
    
    if(document.getElementById('search-result')){
        document.body.removeChild(document.getElementById('search-result'))
    }
    
    var search_result = document.createElement('div')
    search_result.id = 'search-result'

    var result_statement = document.createElement('p')
    result_statement.innerText = "SEARCH RESULTS"

    var sub_search_result = document.createElement('div')

    for(var i=0; i<data.length; i++){
        
        var full_username = data[i].username.split('-')

        var result_user = document.createElement('div')
        result_user.className = "result-user"
        result_user.addEventListener('click', function(){
            var parentest = this.querySelector('.name_username')
            var lowerParent = parentest.querySelector('.search_username')
            var profile = lowerParent.innerText.split('@')[1].toLowerCase()

            var history = new SearchHistoryManager(profile)
            history.add_to_history()

            Redirect('http://localhost:8000/portal/profile/'+ profile +'/')  
        })

        var picture_detail = document.createElement('div')
        picture_detail.className = "picture-detail"

        var profile_img = document.createElement('div')
        profile_img.className = "profile-img"
        profile_img.innerText = (full_username[0][0] + full_username[1][0]).toUpperCase()

        var name_username = document.createElement('div')
        name_username.className = 'name_username'

        var name = document.createElement('p')
        name.innerText = full_username[0] +" "+ full_username[1]

        var username = document.createElement('p')
        username.innerText = "@" + data[i].username
        username.className = 'search_username'

        result_user.appendChild(picture_detail)
        picture_detail.appendChild(profile_img)
        picture_detail.appendChild(name_username)
        name_username.appendChild(name)
        name_username.appendChild(username)

        sub_search_result.appendChild(result_user)
    }

    search_result.appendChild(result_statement)
    search_result.appendChild(sub_search_result)
    document.body.appendChild(search_result)
    
    search_result.style.left = coordinate.left - (sub_search_result.clientWidth/2) + (elem.clientWidth/2) +'px'
    search_result.style.top = coordinate.top + elem.clientHeight +10 +'px'
}

function CloseSearchBox(){
    if(document.getElementById('search-result')){
        var searchbox = document.getElementById('search-result')
        document.body.removeChild(searchbox)
    }
}



function HistoryBox(elem){
    var coordinate = elem.getBoundingClientRect()

    var history = new SearchHistoryManager()
    var history_list = history.history_list()

    if (history.history_exist()){
        if(document.getElementById('search-result')){
            document.body.removeChild(document.getElementById('search-result'))
        }
    
        var search_result = document.createElement('div')
        search_result.id = 'search-result'
    
        var result_statement = document.createElement('p')
        result_statement.innerText = "YOUR RECENT SEARCHES"
    
        search_result.appendChild(result_statement)
    
        for(var i=0; i<history_list.length; i++){
            var recent_searches = document.createElement('div')
            recent_searches.id = "recent-search"
    
            var history_svg = document.createElement('img')
            history_svg.src = "/static/png/history.svg"
    
            var recent_search = document.createElement('a')
            recent_search.innerText = history_list[i]
            recent_search.addEventListener('click', function(){
                Redirect('http://localhost:8000/portal/profile/'+ this.innerText +'/')
            })
    
            var remove_svg = document.createElement('img')
            remove_svg.src = "/static/png/delete_history.svg"
            remove_svg.addEventListener('mouseover', function(){
                ToolTip(this, 'remove')
            })
            remove_svg.addEventListener('mouseout', function(){
                hideToolTip()
            })
            remove_svg.addEventListener('click', function(){
                var manager = new SearchHistoryManager(this.parentElement.querySelector('a').innerText)
                manager.remove_from_history()
                hideToolTip()
                this.parentElement.style.display = 'none'
            })
    
            recent_searches.appendChild(history_svg)
            recent_searches.appendChild(recent_search)
            recent_searches.appendChild(remove_svg)
            search_result.appendChild(recent_searches)
        }
    
        document.body.appendChild(search_result)
        search_result.style.left = coordinate.left - (search_result.clientWidth/2) + (elem.clientWidth/2) +'px'
        search_result.style.top = coordinate.top + elem.clientHeight +10 +'px'
    }
}


document.addEventListener("DOMContentLoaded",function(){
    var account = document.getElementsByClassName('account')[0];
    account.addEventListener('click', function(){
        var fields = {
            'Account': 'portal/account/',
            'Profile': 'portal/profile/',
            'Billing' : 'portal/billing/',
            'Delete': 'portal/account/delete/'
        }
        var dropdown = new DropDown(this, fields, true)
        dropdown.open()
    })

    var filter_key = document.getElementById('search-filter');
    filter_key.addEventListener('mouseover', function(){
        ToolTip(this, 'search by')
    })
    filter_key.addEventListener('mouseout', hideToolTip)
    filter_key.addEventListener('click', function(){
        var fields = {
            'first_name': 'first_name',
            'username': 'username',
            'email' : 'email',
            'organization': 'organization'
        }
        var dropdown = new DropDown(this, fields, false, true)
        dropdown.open()
    })

    var search = document.getElementById('filter-value');
    search.addEventListener('input', async function(){
        var key = document.getElementById('filter-key').innerText
        var value = document.getElementById('filter-value').value
        var url = 'http://localhost:8000/portal/auth/search-user/'
        if(value == ''){
            HistoryBox(this)
        }else{
            var searcher = new Search(key, value, url)
            var data = await searcher.search()
            
            SearchBox(this, data)
        }
    })
    search.addEventListener('click', function(){
        if(!document.getElementById('search-result')){
            HistoryBox(this)
        }
    })

    var notification = document.getElementsByClassName('notification')[0];
    notification.addEventListener('click', async function(){
        Redirect('http://localhost:8000/portal/notification/')
    })


    var signout = document.getElementById('signout')
    signout.addEventListener('click', async function(){
        var endpoint = new Consumer('http://localhost:8000/portal/auth/signout/', {}, 'DELETE', true, false)
        var response = await endpoint.fetch_response()
        DeleteAuthToken()
        
        var alerting = new CustomAlert(response['detail'], 'green')
        alerting.raise()

        await delay(2000)
        Redirect('http://localhost:8000/portal/login/')
    })


    //EVENT HANDLER THAT MAKEs POPUP TO DISAPEAR WHEN CLICK OUTSIDE OF IT
    document.addEventListener('click', function(event){
        //account element
        var account = document.getElementsByClassName('account')[0]
        //filter key element
        var filter_key = document.getElementById('search-filter')
        //search-bar element
        var search_bar = document.getElementById('filter-value')
        try {
            //if the searchbox popup exist
            if(document.getElementById('search-result')){
                //reference to the searchbox popup
                var searchbox = document.getElementById('search-result')
                //if the event is not targetted to the searchbox i.e click is outside the boundary 
                if(!searchbox.contains(event.target)){
                    //if the target element is not the searchbox and the search bar 
                    if(event.target !== searchbox && event.target !== search_bar ){
                        //close the searchbox
                        CloseSearchBox()
                    }
                }
            }

            //if the dropdown popup exist
            if(document.getElementById('dropdown')){
                //reference to the dropdown popup
                var dropdown = document.getElementById('dropdown')
                //if the event is not targetted to the dropdown
                if(!dropdown.contains(event.target)){
                    //if the target element is not the filter=key and account 
                    if((event.target !== filter_key) && (event.target !== account)){
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