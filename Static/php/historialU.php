<?php
session_start();
if (!isset($_SESSION["id_paciente"])) {
    header("Location: login.php");
    exit;
}

$id = $_SESSION["id_paciente"];

require "conexion.php";

$query_futuras = $conn->prepare("
    SELECT c.*, o.nombre AS odontologo
    FROM citas c
    LEFT JOIN odontologos o ON c.id_odontologo = o.id
    WHERE c.id_paciente = ?
    AND c.fecha >= CURDATE()
    ORDER BY c.fecha, c.hora
");
$query_futuras->execute([$id]);
$citas_futuras = $query_futuras->fetchAll(PDO::FETCH_ASSOC);

$query_pasadas = $conn->prepare("
    SELECT c.*, o.nombre AS odontologo
    FROM citas c
    LEFT JOIN odontologos o ON c.id_odontologo = o.id
    WHERE c.id_paciente = ?
    AND c.fecha < CURDATE()
    ORDER BY c.fecha DESC, c.hora DESC
");
$query_pasadas->execute([$id]);
$citas_pasadas = $query_pasadas->fetchAll(PDO::FETCH_ASSOC);

include "citas.html";
?>
