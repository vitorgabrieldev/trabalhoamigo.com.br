<?php

if (!isset($_SESSION)) {
    session_start();
};

if (isset($_SESSION['logado']) && isset($_SESSION['tipo_usuario'])) {
    if ($_SESSION['tipo_usuario'] == 'contratante') {
        echo 'true';
    } else {
        echo 'false';
    }
} else {
    echo 'false';
};
