const socket = io()

//elements
const $messageform = document.querySelector('#messageform')
const $messageforminput = $messageform.querySelector('input')
const $messageformbutton = $messageform.querySelector('button')
const $sharelocationbutton = document.querySelector('#sharelocation')
const $messages = document.querySelector('#messages')


//templates
const messagetemplate = document.querySelector('#messagetemplate').innerHTML
const locationmessagetemplate = document.querySelector('#locationmessagetemplate').innerHTML
const sidebartemplate = document.querySelector('#sidebartemplate').innerHTML

//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    //new message 
    const $newmessage = $messages.lastElementChild

    //height
    const newmessagestyles = getComputedStyle($newmessage)
    const newmessagemargin = parseInt(newmessagestyles.marginBottom)
    const newmessageheight = $newmessage.offsetHeight + newmessagemargin

    //visible height
    const visibleheight = $messages.offsetHeight

    //height of messages container
    const containerheight = $messages.scrollHeight

    //how far have i scrolled
    const scrolloffset = $messages.scrollTop + visibleheight

    if (containerheight - newmessageheight <= scrolloffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messagetemplate, {
        username: message.username,
        message: message.text,
        createdat: moment(message.createdat).format('HH:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()

})

socket.on('locationmessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationmessagetemplate, {
        username: message.username,
        url: message.url,
        createdat: moment(message.createdat).format('HH:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomdata', ({ room, users }) => {
    const html = Mustache.render(sidebartemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})




document.querySelector('#messageform').addEventListener('submit', (e) => {
    e.preventDefault()

    $messageformbutton.setAttribute('disabled', 'disabled')
    //disable
    const message = e.target.elements.message.value

    socket.emit('sendmessage', message, (error) => {
        $messageformbutton.removeAttribute('disabled')
        $messageforminput.value = ''
        $messageforminput.focus()
        //enable
        if (error) {
            return console.log(error)
        }
        console.log('Message Delivered')
    })
})

$sharelocationbutton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }
    $sharelocationbutton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sharelocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sharelocationbutton.removeAttribute('disabled')
            console.log('Location Shared!')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})