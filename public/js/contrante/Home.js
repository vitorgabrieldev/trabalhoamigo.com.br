const Logout = () => {
    $.ajax({
        url: `../../../controllers/contratante/Logout.php`,
        method: 'GET',
        success: function (data) {
            if (data == 'true') {
            } else if (data == 'false') {
                window.location.href = "../CriarConta/";
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
}; 