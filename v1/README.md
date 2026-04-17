# Trabalho Amigo - Community service sharing platform

**Our project connects people who need services to professionals who can offer them. The platform allows users to find providers in different areas, from simple tasks to specialized services. Professionals are evaluated by clients, ensuring safe and reliable hiring. Thus, we facilitate the meeting between those looking for a service and those available to provide it.**

> [!IMPORTANT]
> **The project is not yet complete**, as it is currently in the development phase as part of a course conclusion work. We are focused on building the core functionalities and validating the viability of the platform. The current version serves as a prototype, and future expansions and improvements are planned for when the project is at a more advanced stage, including interface optimizations, integration of new services and improvement of evaluation and security tools for users.

# Steps to install the project
**To configure the project locally, follow the steps below:**

## 1. Prerequisites
**Before you begin, make sure you have the following tools installed on your system:**

[![Git](https://img.shields.io/badge/Git-E34F26?style=for-the-badge&logo=git&logoColor=white)](https://git-scm.com/)
[![Apache](https://img.shields.io/badge/Apache-CA2136?style=for-the-badge&logo=apache&logoColor=white)](https://www.apache.org/)
[![Visual Studio Code](https://img.shields.io/badge/-Visual%20Studio%20Code-333333?style=flat&logo=visual-studio-code&logoColor=007ACC)](https://code.visualstudio.com/)
[![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

## 2. Cloning the Repository
**Open the terminal and run the command to clone the project repository:**
``` bash
  git clone https://github.com/vitorgabrieldevk/trabalhoamigo.com.br
```

## 3. Starting Server
**With Apache turned on and the MySQL server running, import the database from the file: 'Database.sql'**
``` sql
  mysql -u root -p trabalhoamigo < /path/para/Database.sql
```
> [!NOTE]
> Replace '/path/para/Database.sql' with the path where the file is located, if you are using the `Xampp` server, it will be
> ``` sql
>   mysql -u root -p trabalhoamigo < C:/xampp/htdocs/trabalhoamigo.com.br/Database.sql
> ```

## 4. Running the project
``` bash
   composer install
```

**Now just open the url in your browser:**
``` bash
  localhost/trabalhoamigo.com.br/
```

```mermaid
graph TD;

    A[Start] --> B{Does User Have an Account?};
    B -->|Yes| C[Log In];
    B -->|No| D[Create Account];

    C --> E[Verify Credentials];
    E -->|Valid| F[User Enters Platform];
    E -->|Invalid| G[Show Login Error];

    D --> H[Fill Out Account Information];
    H --> I[Confirm Account Creation];
    
    I --> J[Automatic Login];
    J --> F[User Enters Platform];

    F --> K[Search for Service];
    K --> L[Send Proposal to Service Provider];

    L --> M[Provider Views Proposals];
    M --> N{Accept Proposal?};

    N -->|Yes| O[Access Contractor Contact Information];
    O --> P[Create Contract];
    
    P --> Q[Contract Contains:];
    Q --> R[Contractor Information];
    Q --> S[Provider Information];
    Q --> T[Service Description];
    Q --> U[Price and Terms];
    
    N -->|No| V[End Proposal];

    O --> W[Contractor Receives Provider's Contact Information];
    V --> X[End];
    
    W --> Y[End];
    T --> Y;
```

## Tecnologias Utilizadas

| Aonde?        | Qual?                                                                                               |
|-------------------|-----------------------------------------------------------------------------------------------------|
| **Backend**       | [![PHP](https://img.shields.io/badge/PHP-7B7B7B?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net/) |
| **Frontend**      | [![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)  <br> [![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS) <br> [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript) |
| **Database**| [![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)  |
| **Web Server**  | [![Apache](https://img.shields.io/badge/Apache-CA2136?style=for-the-badge&logo=apache&logoColor=white)](https://httpd.apache.org/)  |

#

> [!WARNING]
> **Due to some problems during development, we did not implement a responsive web version, therefore, it is not possible to access the prototype via cell phone at the moment. We want to expand this experience to a webview App system and a more intuitive and responsive interface so that mobile users can access**.

#

## Collaborators:

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
