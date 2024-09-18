<?php

/* ---------------------------------------------------
| Sistema de Registros de Logs
| ----------------------------------------------------*/
$isActiveLogs = 1;

if ($isActiveLogs == 0) {
    return;
};

$logDir = __DIR__ . '/';
$logFile = $logDir . 'Audit.log';

if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}

function logAccess($logFile, $message) {
    $date = date('Y-m-d H:i:s');
    $logMessage = "[{$date}] {$message}\n";
    
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

$userIP = $_SERVER['REMOTE_ADDR'];
$userAgent = $_SERVER['HTTP_USER_AGENT'];
$referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : 'N/A';
$requestURI = isset($_GET['url']) ? $_GET['url'] : 'N/A';
$acceptLanguage = isset($_SERVER['HTTP_ACCEPT_LANGUAGE']) ? $_SERVER['HTTP_ACCEPT_LANGUAGE'] : 'N/A';
$acceptEncoding = isset($_SERVER['HTTP_ACCEPT_ENCODING']) ? $_SERVER['HTTP_ACCEPT_ENCODING'] : 'N/A';
$acceptCharset = isset($_SERVER['HTTP_ACCEPT_CHARSET']) ? $_SERVER['HTTP_ACCEPT_CHARSET'] : 'N/A';
$browserInfo = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'N/A';
$requestMethod = $_SERVER['REQUEST_METHOD'];
$serverSoftware = isset($_SERVER['SERVER_SOFTWARE']) ? $_SERVER['SERVER_SOFTWARE'] : 'N/A';
$serverName = isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : 'N/A';

$logMessage = "IP: {$userIP} | User-Agent: {$userAgent} | Referer: {$referer} | Request URI: {$requestURI} | Accept-Language: {$acceptLanguage} | Accept-Encoding: {$acceptEncoding} | Accept-Charset: {$acceptCharset} | Browser Info: {$browserInfo} | Request Method: {$requestMethod} | Server Software: {$serverSoftware} | Server Name: {$serverName} \n";

logAccess($logFile, $logMessage);
