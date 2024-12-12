<?php
require_once '/var/www/snackbox/private/config.php'; 
include (PUBLIC_URL . 'site_main/header.html');
?>

<title>CCalculator</title>

<div class="main-content">
    <h1>CCalculator</h1>

    <?php include (__DIR__ . '/CCalcWASM.html'); ?>

</div>
<?php include (PUBLIC_URL . 'site_main/footer.html'); ?>