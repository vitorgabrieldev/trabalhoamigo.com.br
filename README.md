# Trabalho Amigo - Plataforma de compartilhamento de serviços entre comunidade

**Nosso projeto conecta pessoas que precisam de serviços a profissionais que podem oferecê-los. A plataforma permite que os usuários encontrem prestadores de diversas áreas, desde tarefas simples até serviços especializados. Os profissionais são avaliados pelos clientes, garantindo uma contratação segura e confiável. Assim, facilitamos o encontro entre quem busca um serviço e quem está disponível para realizá-lo.**

> [!IMPORTANT]
> **O projeto ainda não está completo**, pois no momento está em fase de desenvolvimento como parte de um trabalho de conclusão de curso. Estamos focados em construir as funcionalidades principais e validar a viabilidade da plataforma. A versão atual serve como um protótipo, e futuras expansões e melhorias estão planejadas para quando o projeto estiver em estágio mais avançado, incluindo otimizações na interface, integração de novos serviços e aprimoramento das ferramentas de avaliação e segurança para os usuários.

# Passos para instalção do projeto
**Para configurar o projeto localmente, siga as etapas abaixo:**

## 1. Pré-requisitos
**Antes de começar, certifique-se de ter as seguintes ferramentas instaladas em seu sistema:**

[![Git](https://img.shields.io/badge/Git-E34F26?style=for-the-badge&logo=git&logoColor=white)](https://git-scm.com/)
[![Apache](https://img.shields.io/badge/Apache-CA2136?style=for-the-badge&logo=apache&logoColor=white)](https://www.apache.org/)
[![Visual Studio Code](https://img.shields.io/badge/-Visual%20Studio%20Code-333333?style=flat&logo=visual-studio-code&logoColor=007ACC)](https://code.visualstudio.com/)
[![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

## 2. Clonando o Repositório
**Abra o terminal e execute o comando para clonar o repositório do projeto:**
``` bash
  git clone https://github.com/vitorgabrieldevk/trabalhoamigo.com.br
```

## 3. Iniciando Servidor
**Com o apache ligado e o servidor mysql em execução, realiza a importação do banco de dados pelo arquivo: 'Database.sql'**
``` sql
  mysql -u root -p trabalhoamigo < /path/para/Database.sql
```
> [!NOTE]
> Substitua o '/path/para/Database.sql' para o caminho no qual se encontra o arquivo, caso esteja usando servidor `Xampp`, será
> ``` sql
>   mysql -u root -p trabalhoamigo < C:/xampp/htdocs/trabalhoamigo.com.br/Database.sql
> ```

## 4. Rodando o projeto
> [!NOTE]
> Não é necessário rodar nenhum comando de instação como yarn, npm ou composer, visto que não há dependências externas.

**Agora basta abrir em seu navegador a url:**
``` bash
  localhost/trabalhoamigo.com.br/
```

```mermaid
graph TD;
    A[Início] --> B{Usuário Tem Conta?};
    B -->|Sim| C[Fazer Login];
    B -->|Não| D[Criar Conta];

    C --> E[Verificar Credenciais];
    E -->|Válidas| F[Contratante Entra na Plataforma];
    E -->|Inválidas| G[Mostrar Erro de Login];

    D --> H[Preencher Informações da Conta];
    H --> I[Confirmar Criação da Conta];
    
    I --> J[Login Automático];
    J --> F[Contratante Entra na Plataforma];

    F --> K[Buscar Serviço];
    K --> L[Enviar Proposta para Anunciante];

    L --> M[Anunciante Visualiza Propostas];
    M --> N{Aceitar Proposta?};

    N -->|Sim| O[Acesso ao Contato do Contratante];
    O --> P[Criar Contrato];
    
    P --> Q[Contrato Contém:];
    Q --> R[Informações do Contratante];
    Q --> S[Informações do Anunciante];
    Q --> T[Descrição do Serviço];
    Q --> U[Preço e Condições];
    
    N -->|Não| V[Encerrar Proposta];

    O --> W[Contratante Recebe Contato do Anunciante];
    V --> X[Fim];
    
    W --> Y[Fim];
    T --> Y;

```

## Tecnologias Utilizadas

| Aonde?        | Qual?                                                                                               |
|-------------------|-----------------------------------------------------------------------------------------------------|
| **Backend**       | [![PHP](https://img.shields.io/badge/PHP-7B7B7B?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net/) |
| **Frontend**      | [![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)  <br> [![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS) <br> [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript) |
| **Banco de Dados**| [![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)  |
| **Servidor Web**  | [![Apache](https://img.shields.io/badge/Apache-CA2136?style=for-the-badge&logo=apache&logoColor=white)](https://httpd.apache.org/)  |

#

> [!WARNING]
> **Decorrente de alguns problemas durante o desenvolvimento, não implementamos uma versão web responsiva, portanto, não é possível acessar o prótipo pelo celular no momento, queremos expandir essa experiência para um sistema de webview App e uma interface mais intuitiva e responsiva para que usuário mobile possam acessar**.

#

## Colaboradores:

<table>
  <tr>
    <td align="center">
      <a href="#" title="defina o título do link">
        <img src="https://avatars.githubusercontent.com/u/124396164?v=4" width="100px;" alt="Vitor Gabriel de Oliveira"/><br>
        <sub>
          <b>Vitor Gabriel</b>
        </sub>
      </a>
    </td>
    <td align="center">
      <a href="#" title="defina o título do link">
        <img src="https://avatars.githubusercontent.com/u/164093262?v=4" width="100px;" alt="João Victor Farias da Silva"/><br>
        <sub>
          <b>João Victor</b>
        </sub>
      </a>
    </td>
    <td align="center">
      <a href="#" title="defina o título do link">
        <img src="https://avatars.githubusercontent.com/u/127868962?v=4" width="100px;" alt="Maria Eduarda Mendes Galvão"/><br>
        <sub>
          <b>Maria Eduarda</b>
        </sub>
      </a>
    </td>
    <td align="center">
      <a href="#" title="defina o título do link">
        <img src="https://avatars.githubusercontent.com/u/127869448?v=4" width="100px;" alt="Thaynna Carolliny Ribeiro dos Santos"/><br>
        <sub>
          <b>Thaynna Carolliny</b>
        </sub>
      </a>
    </td>
    <td align="center">
      <a href="#" title="defina o título do link">
        <img src="https://avatars.githubusercontent.com/u/127868872?v=4" width="100px;" alt="Layla Beatrice"/><br>
        <sub>
          <b>Layla Beatrice</b>
        </sub>
      </a>
    </td>
  </tr>
</table>
