function showModalSettings(idContrato) {
    Swal.fire({
        title: 'Configurações da proposta',
        text: 'Escolha uma ação para o contrato ID: ' + idContrato,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Finalizar',
        cancelButtonText: 'Cancelar',
        showDenyButton: true,
        denyButtonText: 'Excluir',
        showCloseButton: true
    }).then((result) => {
        if (result.isConfirmed) {
            // Requisição AJAX para finalizar o contrato
            $.ajax({
                url: '../../../controllers/contratante/HistoricoProposta.php',
                type: 'POST',
                data: {
                    id: idContrato,
                    acao: 'finalizar' // Ação específica para finalizar
                },
                success: function(response) {
                    let data = JSON.parse(response);
                    if (data.success) {
                        Swal.fire({
                            title: 'Contrato finalizado!',
                            html: `
                                <p>Avalie o serviço prestado:</p>
                                <div id="rating" style="display: flex; justify-content: center; gap: 10px;">
                                    <input type="radio" id="star1" name="rating" value="1">
                                    <label for="star1">⭐</label>
                                    <input type="radio" id="star2" name="rating" value="2">
                                    <label for="star2">⭐⭐</label>
                                    <input type="radio" id="star3" name="rating" value="3">
                                    <label for="star3">⭐⭐⭐</label>
                                    <input type="radio" id="star4" name="rating" value="4">
                                    <label for="star4">⭐⭐⭐⭐</label>
                                    <input type="radio" id="star5" name="rating" value="5">
                                    <label for="star5">⭐⭐⭐⭐⭐</label>
                                </div>
                                <textarea id="comentario" placeholder="Deixe um comentário (opcional)" style="width: 100%; margin-top: 15px; height: 100px;"></textarea>
                            `,
                            confirmButtonText: 'Enviar Avaliação',
                            preConfirm: () => {
                                const selectedRating = document.querySelector('input[name="rating"]:checked');
                                const comentario = document.getElementById('comentario').value;
                        
                                if (!selectedRating) {
                                    Swal.showValidationMessage('Você precisa escolher uma avaliação!');
                                }
                        
                                return {
                                    rating: selectedRating ? selectedRating.value : null,
                                    comentario: comentario
                                };
                            }
                        }).then((ratingResult) => {
                            if (ratingResult.isConfirmed) {
                                // Enviar a avaliação via AJAX
                                $.ajax({
                                    url: '../../../controllers/contratante/HistoricoProposta.php',
                                    type: 'POST',
                                    data: {
                                        id: idContrato,
                                        acao: 'avaliar',
                                        avaliacao: ratingResult.value.rating,  // Enviar o valor correto da avaliação
                                        comentario: ratingResult.value.comentario // Enviar o comentário opcional
                                    },
                                    success: function(response) {
                                        let ratingData = JSON.parse(response);
                                        if (ratingData.success) {
                                            Swal.fire(
                                                'Avaliação enviada!',
                                                'Obrigado por avaliar o serviço.',
                                                'success'
                                            );
                                            location.reload();
                                        } else {
                                            Swal.fire(
                                                'Erro!',
                                                'Não foi possível enviar a avaliação.',
                                                'error'
                                            );
                                            location.reload();
                                        }
                                    },
                                    error: function() {
                                        Swal.fire(
                                            'Erro!',
                                            'Ocorreu um erro ao enviar a avaliação.',
                                            'error'
                                        );
                                        location.reload();
                                    }
                                });
                            }
                        });
                    } else {
                        Swal.fire(
                            'Erro!',
                            'Não foi possível finalizar o contrato.',
                            'error'
                        );
                        location.reload();
                    }
                },
                error: function() {
                    Swal.fire(
                        'Erro!',
                        'Ocorreu um erro ao tentar finalizar o contrato.',
                        'error'
                    );
                    location.reload();
                }
            });

        } else if (result.isDenied) {
            // Requisição AJAX para excluir o contrato
            $.ajax({
                url: '../../../controllers/contratante/HistoricoProposta.php',
                type: 'POST',
                data: {
                    id: idContrato,
                    acao: 'excluir' // Ação específica para excluir
                },
                success: function(response) {
                    let data = JSON.parse(response);
                    if (data.success) {
                        Swal.fire(
                            'Excluído!',
                            'O contrato foi excluído com sucesso.',
                            'success'
                        );
                        location.reload();
                    } else {
                        Swal.fire(
                            'Erro!',
                            'Não foi possível excluir o contrato.',
                            'error'
                        );
                        location.reload();
                    }
                },
                error: function() {
                    Swal.fire(
                        'Erro!',
                        'Ocorreu um erro ao tentar excluir o contrato.',
                        'error'
                    );
                    location.reload();
                }
            });

        } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire(
                'Cancelado',
                'Nenhuma ação foi realizada.',
                'error'
            );
        }
    });
}
