<?php
/* Fast Quality Appliance Repair — booking form handler
   Receives the order form (name, phone, address, appliance)
   and emails the lead to the business inbox. */

header('Content-Type: application/json; charset=utf-8');

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method']);
    exit;
}

// ---- Settings ----
$to   = 'office@fastquality.org';      // where leads are delivered
$from = 'noreply@fastquality.us';      // must be on this domain (SPF/DKIM valid)
$site = 'Fast Quality Appliance Repair';

// ---- Honeypot (silently accept bots, do not email) ----
if (!empty($_POST['company'])) {
    echo json_encode(['ok' => true]);
    exit;
}

// ---- Collect + sanitize ----
function clean($v) {
    return trim(preg_replace('/[\r\n]+/', ' ', strip_tags((string)$v)));
}
$name      = clean($_POST['name']      ?? '');
$phone     = clean($_POST['phone']     ?? '');
$address   = clean($_POST['address']   ?? '');
$appliance = clean($_POST['appliance'] ?? '');
$page      = clean($_POST['page']      ?? '');

// ---- Validate required fields ----
if ($name === '' || $phone === '' || $appliance === '') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'missing']);
    exit;
}
// phone must contain at least 7 digits
if (preg_match_all('/\d/', $phone) < 7) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'phone']);
    exit;
}

// ---- Build email ----
$subject = "New service request — $appliance";

$body  = "New appliance repair request from the website.\n\n";
$body .= "Name:       $name\n";
$body .= "Phone:      $phone\n";
if ($address !== '') {
    $body .= "Address:    $address\n";
}
$body .= "Appliance:  $appliance\n";
$body .= "\n";
$body .= "Submitted:  " . date('Y-m-d H:i:s') . " (server time)\n";
if ($page !== '') {
    $body .= "From page:  $page\n";
}
$body .= "IP:         " . ($_SERVER['REMOTE_ADDR'] ?? 'n/a') . "\n";

$headers  = "From: $site <$from>\r\n";
$headers .= "Reply-To: $from\r\n";
$headers .= "Content-Type: text/plain; charset=utf-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Envelope sender (-f) helps SPF / deliverability
$sent = @mail($to, $subject, $body, $headers, "-f$from");

if ($sent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'send']);
}
