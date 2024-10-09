/* ------------------------------------------------------------
| Sistema de popup do usuário
/-------------------------------------------------------------- */

$("#offCanva-mobile").toggle();
$(".openMenuTopo").click(() => {
    $("#offCanva-mobile").toggle();
});

$("#popup-profile").toggle();
$(".userProfile-circle").click(() => {
    $("#popup-profile").toggle();
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
    { name: 'keywords', content: 'trabalho, amigo, freelancer, serviços, comunidade' },
    { name: 'author', content: 'Trabalho Amigo' },
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
| Sistema de criaçõa de barra de acessibildiade
/-------------------------------------------------------------- */
function createAccessibilityBar() {
    const accessibilityBar = document.createElement('div');
    accessibilityBar.id = 'accessibility-bar';
    accessibilityBar.innerHTML = `
        <div class="accessibility-bar-content">
            <button id="toggle-contrast" title="Toggle Contrast">🌗</button>
            <button id="increase-font-size" title="Increase Font Size">A+</button>
            <button id="decrease-font-size" title="Decrease Font Size">A-</button>
            <button id="increase-line-height" title="Increase Line Height">Line+</button>
            <button id="decrease-line-height" title="Decrease Line Height">Line-</button>
            <button id="change-font" title="Change Font">Font</button>
            <button id="reset-settings" title="Reset Settings">🔄</button>
        </div>
    `;
    document.body.appendChild(accessibilityBar);

    const styles = `#accessibility-bar {position: fixed;bottom: 10px;right: 10px;background-color: #222;color: #fff;padding: 15px;border-radius: 8px;box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);z-index: 1000;}.accessibility-bar-content {display: flex;flex-direction: column;gap: 10px;}.accessibility-bar-content button {background: #2B88F4;border: none;color: #fff;padding: 10px 15px;border-radius: 5px;cursor: pointer;font-size: 16px;transition: background 0.3s ease;}.accessibility-bar-content button:hover {background: #1a5ab0;}`;
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    const fontOptions = ['Arial', 'Verdana', 'Georgia', 'Times New Roman', 'Courier New'];
    let currentFontIndex = 0;
    let currentLineHeight = 1.5;

    document.getElementById('toggle-contrast').addEventListener('click', () => {
        document.body.classList.toggle('high-contrast');
    });

    document.getElementById('increase-font-size').addEventListener('click', () => {
        document.body.style.fontSize = 'larger';
    });

    document.getElementById('decrease-font-size').addEventListener('click', () => {
        document.body.style.fontSize = 'smaller';
    });

    document.getElementById('increase-line-height').addEventListener('click', () => {
        currentLineHeight += 0.1;
        document.body.style.lineHeight = currentLineHeight;
    });

    document.getElementById('decrease-line-height').addEventListener('click', () => {
        if (currentLineHeight > 1) {
            currentLineHeight -= 0.1;
            document.body.style.lineHeight = currentLineHeight;
        }
    });

    document.getElementById('change-font').addEventListener('click', () => {
        currentFontIndex = (currentFontIndex + 1) % fontOptions.length;
        document.body.style.fontFamily = fontOptions[currentFontIndex];
    });

    document.getElementById('reset-settings').addEventListener('click', () => {
        document.body.classList.remove('high-contrast');
        document.body.style.fontSize = '';
        document.body.style.lineHeight = '';
        document.body.style.fontFamily = '';
        currentLineHeight = 1.5;
    });
}

createAccessibilityBar();

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
| Sistema de Inserção de política de Segurança de Conteúdo (CSP)
/-------------------------------------------------------------- */
// function setContentSecurityPolicy() {
//     const meta = document.createElement('meta');
//     meta.httpEquiv = 'Content-Security-Policy';
//     meta.content = "default-src 'self'; img-src * data:; script-src 'self' https://trusted.cdn.com; style-src 'self' 'unsafe-inline';";
//     document.head.appendChild(meta);
// }

// setContentSecurityPolicy();

/* ------------------------------------------------------------
| Sistema de Inserção de logs para auditoria
/-------------------------------------------------------------- */
function logUserAccess() {
    var currentUrl = window.location.href;
    var screenWidth = window.screen.width;
    var screenHeight = window.screen.height;
    
    $.ajax({
        url: '/trabalhoamigo.com.br/logs/Audit.php',
        type: 'GET',
        data: {
            url: currentUrl,
            screenWidth: screenWidth,
            screenHeight: screenHeight 
        },
        success: function(response) {
            // console.log('Log registrado com sucesso.');
        },
        error: function(xhr, status, error) {
            console.error('Erro ao registrar o log:', status, error);
        }
    });
}

$(document).ready(function() {
    logUserAccess();
});


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

$(".DispathAlert").click(() => {
    Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Em construção...",
    });
});


let servicoId;

function openModal(id, titulo, descricao, preco) {
    servicoId = id;
    document.getElementById('modal-titulo').innerText = titulo;
    document.getElementById('modal-descricao').innerText = descricao;
    document.getElementById('modal-preco').innerText = 'Preço: R$ ' + preco.toFixed(2).replace('.', ',');
    document.getElementById('contratar-btn').setAttribute('href', '../FormularioProposta/?id=' + servicoId); 
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target == modal) {
        closeModal();
    }
}
