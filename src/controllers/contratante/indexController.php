<?php
class IndexController {
    public function handleRequest() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (isset($_POST['action'])) {
                $action = $_POST['action'];
                switch ($action) {
                    case 'sayHello':
                        $this->sayHello();
                        break;
                    case 'addNumbers':
                        $this->addNumbers();
                        break;
                    default:
                        echo json_encode(['status' => 'error', 'message' => 'Action not recognized']);
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No action specified']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
        }
    }

    private function sayHello() {
        echo json_encode(['status' => 'success', 'message' => 'Hello, World!']);
    }

    private function addNumbers() {
        if (isset($_POST['num1']) && isset($_POST['num2'])) {
            $num1 = (int)$_POST['num1'];
            $num2 = (int)$_POST['num2'];
            $sum = $num1 + $num2;
            echo json_encode(['status' => 'success', 'sum' => $sum]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Missing numbers']);
        }
    }
}

// Instancia e chama o método de tratamento da requisição
$controller = new IndexController();
$controller->handleRequest();