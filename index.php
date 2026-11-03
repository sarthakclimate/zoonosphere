<?php
$data = json_decode(file_get_contents(__DIR__ . '/data.json'), true);
$nd = count($data['diseases']);
$nr = count($data['refs']);
$sp = [];
foreach ($data['diseases'] as $d) foreach ($d['s'] as $s) $sp[$s] = 1;
$ns = count($sp);
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Zoonotic Network · Mammalian Hosts &amp; Evidence</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<header><h1>Zoonotic Network</h1><div class="sub">Diseases · Mammalian hosts · Evidence</div><nav class="switch"><a href="index.php" class="on">Diseases · Mammals · Studies</a><a href="orders.php">Pathogens · Host orders</a></nav></header>
<div class="stats">
  <div class="chip d"><b><?= $nd ?></b><span>Diseases</span></div>
  <div class="chip m"><b><?= $ns ?></b><span>Mammals</span></div>
  <div class="chip r"><b><?= $nr ?></b><span>Studies</span></div>
</div>
<div id="crumbs"></div>
<svg id="net" viewBox="-580 -520 1160 1040" preserveAspectRatio="xMidYMid meet">
  <defs>
    <filter id="glowT" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="4" result="b"/><feFlood flood-color="#5eead4" flood-opacity=".8"/><feComposite in2="b" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glowA" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="4" result="b"/><feFlood flood-color="#fbbf24" flood-opacity=".8"/><feComposite in2="b" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glowV" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="4" result="b"/><feFlood flood-color="#a78bfa" flood-opacity=".8"/><feComposite in2="b" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <radialGradient id="hubG"><stop offset="0" stop-color="#6d5dfc"/><stop offset="1" stop-color="#1e2a6b"/></radialGradient>
  </defs>
  <g id="layer"></g>
</svg>
<div id="info"></div>
<aside id="panel"><button class="x" aria-label="Close">✕</button><div id="pbody"></div></aside>

<script src="app.js"></script>
</body>
</html>
