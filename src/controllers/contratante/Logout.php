<?php

if (!isset($_SESSION)) {
    session_start();
};

session_destroy();

if (isset($_SESSION['logado'])) {
    echo 'false';
} else {
    echo 'true';
};