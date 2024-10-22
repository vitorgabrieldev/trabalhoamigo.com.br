const form = document.querySelector(".typing-area"),
    incoming_id = form.querySelector(".incoming_id").value,
    inputField = form.querySelector(".input-field"),
    sendBtn = form.querySelector("button"),
    chatBox = document.querySelector(".chat-box");

inputField.disabled = true;
sendBtn.disabled = true;

let lastMessageId = 0; // Guardar o ID da última mensagem

// Evita o envio padrão do formulário
form.onsubmit = (e) => {
    e.preventDefault();
}

inputField.focus();
inputField.onkeyup = (e) => {
    if (inputField.value != "") {
        sendBtn.classList.add("active");
    } else {
        sendBtn.classList.remove("active");
    }
}

// Envia a mensagem ao clicar no botão ou pressionar Enter
inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && inputField.value != "") {
        sendMessage();
    }
});

sendBtn.onclick = () => {
    if (sendBtn.classList.contains("active")) {
        sendMessage();
    }
}

function sendMessage() {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "php/insert-chat.php", true);

    // Indicador de carregamento
    sendBtn.innerHTML = "<div class='loading-chat'></div>";
    sendBtn.disabled = true;
    inputField.disabled = true;

    xhr.onload = () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            inputField.value = ""; 
            sendBtn.innerHTML = "<i class='fab fa-telegram-plane'></i>"; // Restaura o botão
            sendBtn.disabled = false;
            inputField.disabled = false;
            scrollToBottom();
            fetchMessages();
        }
    }

    let formData = new FormData(form);
    xhr.send(formData);
}

// Função para buscar novas mensagens a partir da última mensagem carregada
function fetchMessages() {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "php/get-chat.php", true);
    xhr.onload = () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            let data = xhr.responseText;
            if (data.trim() !== "") {
                chatBox.innerHTML = data;
                scrollToBottom();
            }
        }
    }
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send("incoming_id=" + incoming_id + "&last_message_id=" + lastMessageId);

    return true;
}

// Monitora se a caixa de chat está ativa
chatBox.onmouseenter = () => {
    chatBox.classList.add("active");
}

chatBox.onmouseleave = () => {
    chatBox.classList.remove("active");
}

// Função para rolar a barra de chat para o fundo
function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function fetchAndStartLoop() {
    const getRequest = await fetchMessages(); 

    if (getRequest) {
        
        inputField.disabled = false;
        sendBtn.disabled = false;
        
        setInterval(() => {
            if (!chatBox.classList.contains("active")) {
                fetchMessages();
            }
        }, 2000);
    }
}

fetchAndStartLoop();
