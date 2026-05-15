<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

$action = isset($_GET['action']) ? $_GET['action'] : '';
$hour = isset($_GET['hour']) ? intval($_GET['hour']) : -1;
$block = isset($_GET['block']) ? intval($_GET['block']) : 0;

if ($action === 'getStatus' && $hour >= 0 && $hour < 24) {
    // Генерируем разные значения для разных блоков (шкал)
    // Используем block для создания уникального seed
    srand($hour * 100 + $block);
    $value = rand(0, 1);
    
    echo json_encode([
        'success' => true,
        'hour' => $hour,
        'block' => $block,
        'value' => $value,
        'timestamp' => time()
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid action or hour']);
}
?>