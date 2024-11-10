<?php
// index.php wrapper for the js calculator

require_once '/var/www/snackbox/private/config.php'; 
include (PUBLIC_URL . 'site_main/header.html');

require_once(PRIVATE_URL . 'process_module_queries.php'); // we now use functions from this other doc
if (processModuleQueries('calculator') < 1) {
    // reach here IF no query parameters found. otherwise, processModuleQueries() will handle the rest.

    echo "<div style='display: flex; align-items: center; flex-direction: column; margin:10px;'>";

    echo "<h1>Calculator</h1>";
    include ('module/calculator_mobile.html');
    
    
    echo "</div>";

} 

include (PUBLIC_URL . 'site_main/footer.html');
?>