/* ------------------------------------------------------------
| Sistema de popup do usuário
/-------------------------------------------------------------- */

$("#offCanva-mobile").toggle();
$(".openMenuTopo").click(() => {
    $("#offCanva-mobile").toggle();
});

// Alterna a visibilidade do #popup-profile e oculta o #notification-dropdown
$("#popup-profile").toggle(); 
$(".userProfile-circle").click(() => {
    $("#popup-profile").toggle();            // Alterna o #popup-profile
    $("#notification-dropdown").hide();      // Oculta o #notification-dropdown
});


/* ------------------------------------------------------------
| Sistema de inserção de tag globalmente
/-------------------------------------------------------------- */
function addFaviconAndMeta(faviconUrl, metaTags, openGraphTags) {
    var link = document.createElement('link');
    link.rel = 'icon';
    link.href = faviconUrl;
    document.head.appendChild(link);

    metaTags.forEach(function(metaInfo) {
        var meta = document.createElement('meta');
        Object.keys(metaInfo).forEach(function(key) {
            meta.setAttribute(key, metaInfo[key]);
        });
        document.head.appendChild(meta);
    });

    openGraphTags.forEach(function(ogInfo) {
        var meta = document.createElement('meta');
        Object.keys(ogInfo).forEach(function(key) {
            meta.setAttribute(key, ogInfo[key]);
        });
        document.head.appendChild(meta);
    });
}

addFaviconAndMeta('/trabalhoamigo.com.br/public/img/logo/favicon.ico', [
    { name: 'description', content: 'TRABALHO AMIGO' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { charset: 'UTF-8' },
    { name: 'keywords', content: 'trabalho, freelancer, serviços, comunidades, trabalho remoto, plataforma de serviços, oportunidades de trabalho, rede colaborativa, trabalho amigo' },
    { name: 'author', content: 'Vitor Gabriel de Oliveira, Maria Eduarda Mendes Galvão, Thaynna Carolliny Ribeiros dos Santos, João Victor Farias da Silva, Layla Beatrice de Oliveira' },
    { name: 'robots', content: 'index, follow' },
    { name: 'googlebot', content: 'index, follow' },
    { name: 'theme-color', content: '#2B88F4' },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'application-name', content: 'Trabalho Amigo' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: 'Trabalho Amigo' },
    { name: 'msapplication-TileColor', content: '#2B88F4' },
    { name: 'msapplication-TileImage', content: '/trabalhoamigo.com.br/public/img/logo/favicon-144.png' },
    { name: 'msapplication-config', content: '/trabalhoamigo.com.br/public/browserconfig.xml' },
    { httpEquiv: 'X-UA-Compatible', content: 'IE=edge' },
    { httpEquiv: 'Content-Type', content: 'text/html; charset=UTF-8' },
    { httpEquiv: 'Content-Language', content: 'pt-br' },
    { name: 'rating', content: 'general' }, 
    { name: 'distribution', content: 'global' }, 
    { name: 'revisit-after', content: '7 days' }, 
    { name: 'msvalidate.01', content: 'XXXXXXXXXXXXXXXXXXXXXXXXXX' },
    { name: 'yandex-verification', content: 'XXXXXXXXXXXXXXXX' },
    { name: 'canonical', href: 'https://trabalhoamigo.com.br/' },
    { name: 'og:email', content: 'contato@trabalhoamigo.com.br' }
], [
    { property: 'og:title', content: 'Trabalho Amigo' },
    { property: 'og:description', content: 'Sozinhos somos um, Juntos somos mais' },
    { property: 'og:image', content: '/trabalhoamigo.com.br/public/img/logo/opengraph.png' },
    { property: 'og:url', content: 'https://trabalhoamigo/' },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: 'pt_BR' },
    { property: 'og:site_name', content: 'Trabalho Amigo' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:type', content: 'image/png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@trabalhoamigo' },
    { name: 'twitter:title', content: 'Trabalho Amigo' },
    { name: 'twitter:description', content: 'Sozinhos somos um, Juntos somos mais' },
    { name: 'twitter:image', content: '/trabalhoamigo.com.br/public/img/logo/opengraph.png' }
]);

/* ------------------------------------------------------------
| Sistema de inserção de loading="lazy" em todas as tag <img>
/-------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    const lazyImages = document.querySelectorAll('img[data-src]');

    const lazyLoad = (target) => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        target.forEach((img) => observer.observe(img));
    };

    lazyLoad(lazyImages);
});

/* ------------------------------------------------------------
| Sistema de inserção de SEO em todas as páginas
/-------------------------------------------------------------- */
function addSEOData() {
    const metaTags = [
        { name: 'keywords', content: 'trabalhoamigo, trabalho, freelancer, emprego, trabalho, renda, extra, comunicação' },
        { name: 'author', content: 'Vitor Gabriel de Oliveira, Maria Eduarda Mendes Galvão, João Victor Farias da Sailva, Thaynna Carolliny Ribeiros dos Santos, Layla Beatrice' },
        { name: 'robots', content: 'index, follow' }
    ];

    metaTags.forEach(tag => {
        const meta = document.createElement('meta');
        Object.keys(tag).forEach(key => {
            meta.setAttribute(key, tag[key]);
        });
        document.head.appendChild(meta);
    });
}

addSEOData();

/* ------------------------------------------------------------
| Sistema de broqueio para telas menores (Temporário)
/-------------------------------------------------------------- */
setInterval(() => {
    const blurMediaScreen = document.querySelector('.blurMediaScreen');

    if (window.innerWidth < 1024) {
        if (!blurMediaScreen) {
            document.body.innerHTML += `
                <div class="blurMediaScreen" style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-color: black;
                    color: white;
                    font-family: Arial, sans-serif;
                    font-size: 24px;
                    text-align: center;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    z-index: 1000;
                ">
                    <p>Este site não está disponível para dispositivos móveis.</p>
                </div>
            `;
        }
    } else {
        if (blurMediaScreen) {
            blurMediaScreen.remove();
        }
    }
}, 1000);

/* ------------------------------------------------------------
| Sistema de disparo de alerta de construção ativa
/-------------------------------------------------------------- */
$(".DispathAlert").click(() => {
    Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Em construção...",
    });
});


/* ------------------------------------------------------------
| Sistema de modal dos serviços
/-------------------------------------------------------------- */
let servicoId, isComunitario;

function openModal(id, titulo, descricao, preco) {
    servicoId = id; 

    isComunitario = parseInt(preco) == 0 ? ' (Comunitário)' : '';

    document.getElementById('modal-titulo').innerHTML = '<strong>Título:</strong> ' + titulo;
    document.getElementById('modal-descricao').innerHTML = '<strong>Descrição:</strong> ' + descricao;
    document.getElementById('modal-preco').innerHTML = '<strong>Preço:</strong> R$ ' + preco.toFixed(2).replace('.', ',') + isComunitario;
    document.getElementById('contratar-btn').setAttribute('href', '../FormularioProposta/?id=' + servicoId); 
    document.getElementById('modal').style.display = 'block';
}

/* ------------------------------------------------------------
| Sistema de fechamento do modal de serviços
/-------------------------------------------------------------- */
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

/* ------------------------------------------------------------
| Sistema de fechamento de modal quando clique fora da caixa
/-------------------------------------------------------------- */
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target == modal) {
        closeModal();
    }
}

/* ------------------------------------------------------------
| Sistema de deslogar geral
/-------------------------------------------------------------- */
var Logout = () => {
    // Adiciona a confirmação antes de continuar
    Swal.fire({
        title: 'Você tem certeza?',
        text: "Você deseja sair da sua conta?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, sair!',
        cancelButtonText: 'Não, ficar!'
    }).then((result) => {
        if (result.isConfirmed) {
            // Se o usuário confirmar, executa a requisição AJAX
            $.ajax({
                url: `../../../controllers/contratante/Logout.php`,
                method: 'GET',
                success: function (data) {
                   if (data === 'false') {
                    location.href = "../EntrarConta/";
                   }
                },
                error: function () {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro',
                        text: 'Erro na Autenticação.'
                    });
                }
            });
        }
    });
};

/*------------------------------------------------------
*  Sistema de aplicação de máscaras
* ----------------------------------------------------- */
function aplicarMascara(input, mascara) {
    let valor = input.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    let valorMascarado = '';
    let i = 0;

    valorMascarado = mascara.replace(/#/g, () => valor[i++] || '');
    input.value = valorMascarado;
}

function definirMascaras() {
    const inputsComMascara = document.querySelectorAll('input[class*="mascara"]');

    inputsComMascara.forEach(input => {
        input.addEventListener('input', () => {
            // CPF
            if (input.classList.contains('mascara-cpf')) {
                aplicarMascara(input, '###.###.###-##');
            }

            // CNPJ
            if (input.classList.contains('mascara-cnpj')) {
                aplicarMascara(input, '##.###.###/####-##');
            }

            // Telefone (com DDD)
            if (input.classList.contains('mascara-telefone')) {
                let valor = input.value.replace(/\D/g, '');
                let mascara = valor.length > 10 ? '(##) #####-####' : '(##) ####-####';
                aplicarMascara(input, mascara);
            }

            // Data
            if (input.classList.contains('mascara-data')) {
                aplicarMascara(input, '##/##/####');
            }

            // CEP
            if (input.classList.contains('mascara-cep')) {
                aplicarMascara(input, '#####-###');
            }

            // RG
            if (input.classList.contains('mascara-rg')) {
                aplicarMascara(input, '##.###.###-#');
            }

            // Cartão de crédito
            if (input.classList.contains('mascara-cartao')) {
                aplicarMascara(input, '#### #### #### ####');
            }

            // Vencimento do cartão (MM/AA)
            if (input.classList.contains('mascara-cartao-vencimento')) {
                aplicarMascara(input, '##/##');
            }

            // Código de segurança do cartão (CVV)
            if (input.classList.contains('mascara-cartao-cvv')) {
                aplicarMascara(input, '###');
            }

            // Dinheiro (formato R$)
            if (input.classList.contains('mascara-dinheiro')) {
                let valor = input.value.replace(/[^0-9]/g, '');
                valor = (valor / 100).toFixed(2).replace('.', ',');
                aplicarMascara(input, 'R$ #.##0,00');
                input.value = input.value.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'); 
            }

            // Porcentagem
            if (input.classList.contains('mascara-porcentagem')) {
                let valor = input.value.replace(/[^0-9]/g, ''); 
                aplicarMascara(input, '##0,00%');
                input.value = valor.slice(0, 5) + '%';
            }

            // Número inteiro
            if (input.classList.contains('mascara-numero')) {
                aplicarMascara(input, '####');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', definirMascaras);


/*------------------------------------------------------
*  Sistema de contagem de de input
* ----------------------------------------------------- */
function updateCharCount() {
    const maxLength = 5000;
    
    const descricaoVal = $("#descricao").val() || ""; 
    const currentLength = descricaoVal.length;
    const remainingChars = maxLength - currentLength;
    
    $(".count").text(remainingChars);
}

$("#descricao").on("input", updateCharCount);

$(document).ready(function() {
    if ($("#descricao").length) {
        updateCharCount();
    }
});

/* ------------------------------------------------------------
| Sistema de exclusão de conta
/-------------------------------------------------------------- */
var Delete = () => {
    // Adiciona a confirmação antes de continuar
    Swal.fire({
        title: 'Você tem certeza?',
        text: "Digite 'DELETAR MINHA CONTA' para confirmar a exclusão da conta:",
        icon: 'warning',
        input: 'text', // tipo de input
        inputPlaceholder: 'Digite "DELETAR MINHA CONTA"',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        preConfirm: (inputValue) => {
            if (inputValue !== 'DELETAR MINHA CONTA') {
                Swal.showValidationMessage('Você deve digitar "DELETAR MINHA CONTA" para continuar');
            }
            return inputValue;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `../../../controllers/global/DeleteAccount.php`, 
                method: 'GET',
                dataType: 'json',
                success: function (data) {
                    console.log("Resposta completa do servidor:", data);
            
                    if (typeof data === 'object' && data !== null) {
                        console.log("Status da resposta:", data.status);
            
                        if (data.status === 'success') {
                            location.href = "../EntrarConta/";
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Erro',
                                text: data.message 
                            });
                        }
                    } else {
                        console.error("A resposta não é um objeto JSON válido:", data);
                        Swal.fire({
                            icon: 'error',
                            title: 'Erro',
                            text: 'Resposta do servidor não é JSON válido.'
                        });
                    }
                },
                error: function (xhr, status, error) {
                    console.error("Erro na requisição AJAX:", status, error); // Log do erro
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro',
                        text: 'Erro na Autenticação.'
                    });
                }
            });
            
        }
    });
    
};