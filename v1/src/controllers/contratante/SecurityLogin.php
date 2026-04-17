<?php

if (!isset($_SESSION)) {
    session_start();
};

if (isset($_SESSION['logado'])) {
    if ($_SESSION['tipo_usuario'] == 'anunciante') {
        echo 'anunciante';
    } else {
        echo 'contratante';
    }
} else {
    echo 'false';
};
