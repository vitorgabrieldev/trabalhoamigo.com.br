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
});