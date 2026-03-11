console.log('If you are seeing this message, the chat.js has been included successfully.')


/*
Function which returns random item from array
Three arrays which form part of a randomly generated user name
*/
const nameParts_1 = ['Happy', 'Sad', 'Grumpy', 'Excited', 'Ambitious', 'Polite', 'Scruffy', 'Elegant', 'Dazzling'];
const nameParts_2 = ['Blue', 'Orange', 'Yellow', 'Purple', 'Black', 'White', 'Green', 'Red'];
const nameParts_3 = ['Horse', 'Seahorse', 'Dog', 'Cat', 'Tiger', 'Shark', 'Monkey', 'Worm', 'Butterfly', 'Eagle'];

function randFromArray(array) {
    let index = Math.floor(Math.random() * array.length);
    return array[index]
}


/*
Global Variables
*/
var url = 'http://localhost:3001';
var socket_id;
var socket = io(url);
var current_id = document.getElementById('current-id');
var current_username = document.getElementById('current-username');
var btn_message = document.getElementById('send-message');
var btn_name = document.getElementById('set-name');
var message_input = document.getElementById('input-message');
var name_input = document.getElementById('input-name');
var chatbox = document.getElementById('chatbox');
var system = document.getElementById('system-panel');
var name = randFromArray(nameParts_1) + randFromArray(nameParts_2) + randFromArray(nameParts_3);


socket.on('connect', ()=> {
    socket_id = socket.id;
    current_id.innerText = socket_id;
})


function renderUser() {
    current_id.innerText = socket_id;
    current_username.innerText = name;
}
renderUser();


/*
Event listener for the send message button
If the user message length is greater than 0, send to the server with a timestamp
Reset the value of input box after value is sent to server
*/
btn_name.addEventListener('click', ()=>{

    let previousName = name;
    let name_entered = name_input.value;

    if (name_entered.length > 0) {
        name = name_entered;
        name_input.value = '';
    }

    // Emit the new name
    socket.emit('name-change', {
        previousName,
        newName: name,
        id: socket_id
    })

    renderUser();
})


/*
Event listener for the send message button
If the user message length is greater than 0, send to the server with a timestamp
Reset the value of input box after value is sent to server
*/
btn_message.addEventListener('click', ()=> {
    let message = message_input.value;

    if (message.length > 0) {
        let data = {
            message: message,
            timestamp: new Date().toISOString(),
            name: name,
            id: socket.id
        }
        socket.emit('chat-message', data)
    } 
    message_input.value = '';
})


/*
[HELPER] Auto adjuster for message scroll height
Pushes user view to the bottom of the chat when new messages come in
*/
function adjustScrollHeight (object) {
    object.scrollTop = object.scrollHeight;
}


/*
[HELPER] Returns a timestamp 
*/
function returnTimestamp () {
    let date = Date().toLocaleString()
    let split = date.split(' (');
    let final = split[0];
    return final
}


/*
Listen for 'chat-message' messages from server
Append name and message to chatbox innerHTML
If user id matches current, align text to right to differentiate from group
*/
socket.on('chat-message', (data)=>{
    let alignClass = (socket.id === data.id) ?  'has-text-right' : '';
    chatbox.innerHTML += 
    `<div class="notification is-white fade-in ${alignClass}">
        <p><strong>${data.name}</strong>: ${data.message}<br><span class="help has-text-grey">${returnTimestamp()}</span></p></div>`
    adjustScrollHeight(chatbox);
})


/*
Listen for 'name-change' messages from server
Append results to system innerHTML
*/
socket.on('name-change', (data) => {
    system.innerHTML += `<div class="notification is-white fade-in">
                            <p class="system-text help"><span class="id-text">${data.id}</span> changed name from <span class="name-text">${data.previousName}</span> to <span class="name-text">${data.newName}</span></p>
                         </div>`
    adjustScrollHeight(system);
})


/*
Listen for 'system' messages from server
Append results to system innerHTML
*/
socket.on('system', (data) => {
    system.innerHTML += `<div class="notification is-white fade-in">
                            <p class="system-text help"><span class="id-text">${data.id}</span> has joined the chat.</p>
                        </div>`
    adjustScrollHeight(system);
})