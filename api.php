<?php
// Serves the dataset as JSON. Optional filter: api.php?disease=Rabies
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');

$raw  = file_get_contents(__DIR__ . '/data.json');
$data = json_decode($raw, true);
if (!$data) { http_response_code(500); echo json_encode(['error' => 'Invalid data.json']); exit; }

if (!empty($_GET['disease'])) {
    $q = mb_strtolower(trim($_GET['disease']));
    foreach ($data['diseases'] as $d) {
        if (mb_strtolower($d['n']) === $q) {
            $refs = array_intersect_key($data['refs'], array_flip($d['r']));
            $cn = array_intersect_key($data['cn'] ?? [], array_flip($d['s']));
            echo json_encode(['disease' => $d, 'refs' => $refs, 'cn' => $cn], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
    http_response_code(404);
    echo json_encode(['error' => 'Disease not found']);
    exit;
}
echo json_encode($data, JSON_UNESCAPED_UNICODE);
