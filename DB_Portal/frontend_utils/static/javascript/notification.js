import {ToolTip, hideToolTip} from './utilities.js'


document.addEventListener("DOMContentLoaded",function(){
    var currentYear = 2030 //new Date().getFullYear()
    
    const fromYearSelect = document.getElementById('from-year')
    var option1 = document.createElement('option')
    option1.value=""
    option1.innerText = "Year"
    fromYearSelect.appendChild(option1)
    for(let i=2024; i<=currentYear; i++){
        const option = document.createElement('option')
        option.value = i
        option.innerText = i

        fromYearSelect.appendChild(option)
    }

    const toYearSelect = document.getElementById('to-year')
    var option1 = document.createElement('option')
    option1.value=""
    option1.innerText = "Year"
    toYearSelect.appendChild(option1)
    for(let i=2024; i<=currentYear; i++){
        const option = document.createElement('option')
        option.value = i
        option.innerText = i
        toYearSelect.appendChild(option)
    }

    var mark_all_read = document.getElementById('mark-all-as-read')
    mark_all_read.addEventListener('mouseover', function(){
        ToolTip(this, 'mark all as read')
    })
    mark_all_read.addEventListener('mouseout', hideToolTip)

    var remove = document.getElementById('remove-notification')
    remove.addEventListener('mouseover', function(){
        ToolTip(this, 'remove')
    })
    remove.addEventListener('mouseout', hideToolTip)
})