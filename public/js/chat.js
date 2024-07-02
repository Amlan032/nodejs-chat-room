const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector("#sidebar")

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//Query Params
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix : true})

const autoScroll = () => {
    // $messages.scrollTop = $messages.scrollHeight
    const $latestMsg = $messages.lastElementChild

    //latest msg height
    const latestMsgStyles = getComputedStyle($latestMsg)
    const latestMsgMargin = parseInt(latestMsgStyles.marginBottom)
    const latestMsgHeight = $latestMsg.offsetHeight + latestMsgMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const msgContainerHeight = $messages.scrollHeight

    //how far I have scrolled ?
    const scrollOffset = $messages.scrollTop + visibleHeight
    if(msgContainerHeight - latestMsgHeight <= scrollOffset+1){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('displayMsg', (message) => {
    console.log(message)
    const htmlData = Mustache.render(messageTemplate, {
        username : message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("ddd, MMM D YYYY, h:mm:ss a")
    })
    $messages.insertAdjacentHTML('beforeend', htmlData)
    autoScroll()
})

socket.on('locationMsg', (message) => {
    console.log(message)
    const htmlData = Mustache.render(locationMessageTemplate, {
        username : message.username,
        url: message.text,
        createdAt: moment(message.createdAt).format("ddd, MMM D YYYY, h:mm:ss a")
    })
    $messages.insertAdjacentHTML('beforeend', htmlData)
    autoScroll()
})

socket.on("roomData", ({room, userList}) => {
    const htmlData = Mustache.render(sidebarTemplate, {
        room,
        userList : userList.userList
    })
    $sidebar.innerHTML = htmlData
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('msgReceived', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('location', {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }, (error) => {
            $sendLocationButton.removeAttribute('disabled')
            if(error){
                console.log(error)
            }
            return
            console.log('Location shared!')  
        })
    })
})

socket.emit("join", {username, room}, (error) => {
    if(error){
        alert(error)
        location.href = "/"
    }
})