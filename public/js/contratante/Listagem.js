document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const orderParam = params.get('order');

    if (orderParam) {
        const select = document.getElementById('ordenar_select');
        select.value = orderParam;
    }

    document.getElementById('ordenar_select').addEventListener('change', function() {
        const selectedValue = this.value;
        params.set('order', selectedValue);
        window.location.search = params.toString();
    });

    const swiper = new Swiper('.swiper-container', {
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        slidesPerView: 10,
        spaceBetween: 5, 
        breakpoints: {
            640: {
                slidesPerView: 1,
                spaceBetween: 10
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            1024: {
                slidesPerView: 7,
                spaceBetween: 30
            }
        }
    });

    var items = document.querySelectorAll(".filtro-item");
    var urlParams = new URLSearchParams(window.location.search);
    var categoriaId = urlParams.get('categoria');

    items.forEach(function(item) {
        const itemCategoriaId = item.getAttribute('data-id');

        item.addEventListener('click', function() {
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.set('categoria', itemCategoriaId);
            urlParams.delete('page');
            window.location.search = urlParams.toString();
        });

        if (itemCategoriaId === categoriaId) {
            item.classList.add('activeCategoria');
        }
    });
});