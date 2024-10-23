$(document).ready(function () {
    const form = $(".typing-area"),
        incoming_id = form.find(".incoming_id").val(),
        inputField = form.find(".input-field"),
        sendBtn = form.find("button"),
        chatBox = $(".chat-box");

    inputField.prop("disabled", true);
    sendBtn.prop("disabled", true);

    let lastMessageId = 0; // Guardar o ID da última mensagem

    // Evita o envio padrão do formulário
    form.on("submit", function (e) {
        e.preventDefault();
    });

    inputField.focus();

    inputField.on("keyup", function () {
        if (inputField.val() != "") {
            sendBtn.addClass("active");
        } else {
            sendBtn.removeClass("active");
        }
    });

    // Envia a mensagem ao clicar no botão ou pressionar Enter
    inputField.on("keypress", function (e) {
        if (e.key === "Enter" && inputField.val() != "") {
            sendMessage();
        }
    });

    sendBtn.on("click", function () {
        if (sendBtn.hasClass("active")) {
            sendMessage();
        }
    });

    function sendMessage() {
        const servico_id = new URLSearchParams(window.location.search).get('proposta_id');

        let formData = form.serializeArray(); // Serializa os dados do formulário
        formData.push({ name: 'proposta_id', value: servico_id }); // Adiciona o servico_id

        sendBtn.html("<div class='loading-chat'></div>").prop("disabled", true);
        inputField.prop("disabled", true);

        $.ajax({
            type: "POST",
            url: "php/insert-chat.php",
            data: formData,
            dataType: "json",
            success: function (response) {
                if (response.error) {
                    alert(response.error);
                } else {
                    inputField.val(""); // Limpa o campo de entrada
                    sendBtn.html("<i class='fab fa-telegram-plane'></i>").prop("disabled", false);
                    inputField.prop("disabled", false);
                    scrollToBottom();
                    fetchMessages(); // Chama a função para buscar novas mensagens
                }
            },
            error: function (xhr, status, error) {
                console.error("Erro ao enviar mensagem:", error);
            }
        });
    }

    function fetchMessages() {
        $.ajax({
            type: "POST",
            url: "php/get-chat.php",
            data: {
                incoming_id: incoming_id,
                last_message_id: lastMessageId,
                proposta_id: new URLSearchParams(window.location.search).get('proposta_id')
            },
            success: function (data) {
                if (data.trim() !== "") {
                    chatBox.html(data);
                    scrollToBottom();
                }
            },
            error: function (xhr, status, error) {
                console.error("Erro ao buscar mensagens:", error);
            }
        });
    }

    // Monitora se a caixa de chat está ativa
    chatBox.on("mouseenter", function () {
        chatBox.addClass("active");
    });

    chatBox.on("mouseleave", function () {
        chatBox.removeClass("active");
    });

    // Função para rolar a barra de chat para o fundo
    function scrollToBottom() {
        chatBox.scrollTop(chatBox[0].scrollHeight);
    }

    async function fetchAndStartLoop() {
        await fetchMessages(); // Busca mensagens na inicialização

        inputField.prop("disabled", false);
        sendBtn.prop("disabled", false);
        
        setInterval(() => {
            if (!chatBox.hasClass("active")) {
                fetchMessages();
            }
        }, 2000);
    }

    fetchAndStartLoop();
});
