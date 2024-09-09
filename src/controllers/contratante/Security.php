<?php

if (!isset($_SESSION)) {
    session_start();
};

if (isset($_SESSION['logado'])) {
    echo 'true';
} else {
    echo 'false';
};
