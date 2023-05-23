// Descrição: Arquivo responsável por limpar a escalação de um esporte.

function limparEscalacao(esporte) {
    fetch(`/limparescalacao/${esporte}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Escalação deletada com sucesso!")
                window.location.reload()
            } else {
                alert("Erro ao deletar escalação. Por favor, tente novamente.")
            }
        })

}