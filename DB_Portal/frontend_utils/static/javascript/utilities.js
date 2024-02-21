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