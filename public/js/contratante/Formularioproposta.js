$(document).ready(function() {
    function validarFormulario() {
        var valor = $('#valor').val();
        var descricao = $('#descricao').val();
        var tempo = $('#tempo').val();
        var data_servico = $('#data_servico').val();
        var id = $('#idservico').val();

        if (descricao.length < 10) {
            Swal.fire({
                title: "Atenção!",
                text: "A descrição deve conter no mínimo 10 caracteres.",
                icon: "warning",
                confirmButtonText: "Ok"
            });
            return false;
        }
        if (tempo <= 0) {
            Swal.fire({
                title: "Atenção!",
                text: "O tempo estimado deve ser maior que zero.",
                icon: "warning",
                confirmButtonText: "Ok"
            });
            return false;
        }
        var dataRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (!data_servico || !dataRegex.test(data_servico) || new Date(data_servico) <= new Date() || new Date(data_servico) > new Date(new Date().setFullYear(new Date().getFullYear() + 2))) {
            Swal.fire({
                title: "Atenção!",
                text: "Por favor, insira uma data válida no formato AAAA-MM-DD.",
                icon: "warning",
                confirmButtonText: "Ok"
            });
            
            if (new Date(data_servico) <= new Date()) {
                Swal.fire({
                    title: "Atenção!",
                    text: "A data deve ser maior que a data atual.",
                    icon: "warning",
                    confirmButtonText: "Ok"
                });
            } else if (new Date(data_servico) > new Date(new Date().setFullYear(new Date().getFullYear() + 2))) {
                Swal.fire({
                    title: "Atenção!",
                    text: "A data deve estar dentro dos próximos 2 anos.",
                    icon: "warning",
                    confirmButtonText: "Ok"
                });
            }

            return false;
        }
        
        return true;
    }

    $('#FormProposta').on('submit', function(event) {
        event.preventDefault();

        $(".background-loading-50").removeClass('hidden');

        if (validarFormulario()) {
            $.ajax({
                url: '../../../controllers/contratante/EnvioProposta.php',
                type: 'POST',
                data: {
                    valor: $('#valor').val(),
                    descricao: $('#descricao').val(),
                    tempo: $('#tempo').val(),
                    data_servico: $('#data_servico').val(),
                    id_servico: $('#idservico').val() // Altere para id_servico para corresponder ao PHP
                },
                success: function(response) {
                    $(".background-loading-50").addClass('hidden');
                    if (response === 'true') {
                        Swal.fire({
                            title: "Sucesso!",
                            text: "Proposta enviada com sucesso!",
                            icon: "success",
                            confirmButtonText: "Ok"
                        });
                        location.href = '../ListagemServico/'
                    };
                },
                error: function(xhr, status, error) {
                    $(".background-loading-50").addClass('hidden');
                    $('#mensagem').html('<p>Ocorreu um erro: ' + error + '</p>');
                    Swal.fire({
                        title: "Erro!",
                        text: "Ocorreu um erro ao enviar a proposta.",
                        icon: "error",
                        confirmButtonText: "Ok"
                    });
                }
            });
        } else {
            $(".background-loading-50").addClass('hidden');  
        };
    });
});
