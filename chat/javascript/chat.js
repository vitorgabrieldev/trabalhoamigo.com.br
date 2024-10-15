const form = document.querySelector(".typing-area"),
    incoming_id = form.querySelector(".incoming_id").value,
    inputField = form.querySelector(".input-field"),
    sendBtn = form.querySelector("button"),
    chatBox = document.querySelector(".chat-box");

form.onsubmit = (e) => {
    e.preventDefault(); // Evita o envio padrão do formulário
}

inputField.focus();
inputField.onkeyup = (e) => {
    if (inputField.value != "") {
        sendBtn.classList.add("active");
    } else {
        sendBtn.classList.remove("active");
    }
}

sendBtn.onclick = () => {
    if (sendBtn.classList.contains("active")) {
        sendMessage();
    }
}

function sendMessage() {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "php/insert-chat.php", true);
    
    // Adiciona um indicador de carregamento
    sendBtn.innerHTML = "Enviando..."; // Pode ser um ícone ou texto indicando que está enviando
    sendBtn.disabled = true; // Desabilita o botão enquanto a mensagem está sendo enviada

    xhr.onload = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                inputField.value = ""; // Limpa o campo de entrada
                sendBtn.innerHTML = "<i class='fab fa-telegram-plane'></i>"; // Restaura o texto do botão
                sendBtn.disabled = false; // Habilita o botão novamente
                scrollToBottom(); // Rolagem para o fundo
            }
        }
    }

    let formData = new FormData(form);
    xhr.send(formData);
}

chatBox.onmouseenter = () => {
    chatBox.classList.add("active");
}

chatBox.onmouseleave = () => {
    chatBox.classList.remove("active");
}

setInterval(() => {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "php/get-chat.php", true);
    xhr.onload = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                let data = xhr.response;
                chatBox.innerHTML = data;
                if (!chatBox.classList.contains("active")) {
                    scrollToBottom();
                }
            }
        }
    }
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send("incoming_id=" + incoming_id);
}, 1000);

function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}
