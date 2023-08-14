<?php

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

class Mail
{

    /**
     * @param Database $db Database instance to save the log entry
     * @param $UID
     * @param string $fromMail
     * @param string $fromName
     * @param array $recipients
     * @param string $subject
     * @param string $message
     * @param string $type
     * @param object|null $ical_data
     * @param array $cc
     * @param array $bcc
     * @param array $attachments
     * @param array $embeddedImages
     * @param int $priority
     * @return bool|string
     */
    public static function send(Database $db, $UID, string $fromMail, string $fromName, array $recipients, string $subject, string $message, string $type = 'html', object $ical_data = null, array $cc = [], array $bcc = [], array $attachments = [], array $embeddedImages = [], int $priority = 3)
    {
        // Instantiation and passing `true` enables exceptions
        $mail = new PHPMailer(true);
        try {
            /*
            SMTP::DEBUG_OFF (0): Disable debugging (you can also leave this out completely, 0 is the default).
            SMTP::DEBUG_CLIENT (1): Output messages sent by the client.
            SMTP::DEBUG_SERVER (2): as 1, plus responses received from the server (this is the most useful setting).
            SMTP::DEBUG_CONNECTION (3): as 2, plus more information about the initial connection - this level can help diagnose STARTTLS failures.
            SMTP::DEBUG_LOWLEVEL (4): as 3, plus even lower-level information, very verbose, don't use for debugging SMTP, only low-level problems.
            */
            // $mail->SMTPDebug = 1;               // Enable verbose debug output

            if (isset(FRAMEWORK['EMAIL'])) {
                $mail->isSMTP();
                $mail->Host = FRAMEWORK['EMAIL']['SMTP_SERVER'];          // Specify main and backup SMTP servers
                $mail->SMTPAuth = FRAMEWORK['EMAIL']['SMTP_AUTH'];        // Enable SMTP authentication
                if (isset(FRAMEWORK['EMAIL']['SMTP_AUTH'])) {
                    $mail->Username = FRAMEWORK['EMAIL']['SMTP_USER'];        // SMTP username
                    $mail->Password = FRAMEWORK['EMAIL']['SMTP_PASS'];        // SMTP password
                }
                $mail->SMTPSecure = FRAMEWORK['EMAIL']['SMTP_SECURE'];    // Enable TLS encryption, `ssl` also accepted
                $mail->Port = FRAMEWORK['EMAIL']['SMTP_PORT'];            // TCP port to connect to
                $mail->SMTPAutoTLS = FRAMEWORK['EMAIL']['SMTPAutoTLS'];
            }

            $mail->Priority = $priority;

            // Set sender
            $mail->setFrom($fromMail, $fromName);

            // Add recipients
            foreach ($recipients as $recipient) {
                $mail->addAddress($recipient);
            }

            // Add CC
            foreach ($cc as $recipient) {
                $mail->addCC($recipient);
            }

            // Add BCC
            foreach ($bcc as $recipient) {
                $mail->addBCC($recipient);
            }

            if ($type === 'html') {
                $mail->CharSet = 'UTF-8';
                $mail->isHTML(true);
                $mail->Subject = $subject;
                $mail->Body = $message;
            }

            if ($type === 'ical') {
                $mail->CharSet = 'UTF-8';
                $mail->ContentType = 'text/calendar';
                $mail->Subject = $subject;
                $mail->addCustomHeader('MIME-version', "1.0");
                $mail->addCustomHeader('Content-type', "text/calendar; method=REQUEST; charset=UTF-8");
                $mail->addCustomHeader('Content-Transfer-Encoding', "7bit");
                $mail->addCustomHeader('X-Mailer', "Microsoft Office Outlook 12.0");
                $mail->addCustomHeader("Content-class: urn:content-classes:calendarmessage");

                $ical = "BEGIN:VCALENDAR\r\n";
                $ical .= "VERSION:2.0\r\n";
                $ical .= "PRODID:-//YourCassavaLtd//EateriesDept//EN\r\n";
                $ical .= "METHOD:REQUEST\r\n";
                $ical .= "BEGIN:VEVENT\r\n";
                $ical .= "ORGANIZER;SENT-BY=\"MAILTO:" . $ical_data->organizer . "\":MAILTO:" . $ical_data->onbehalf . "\r\n";
                $ical .= "ATTENDEE;CN=" . $ical_data->cn . ";ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=TRUE:mailto:organizer@kaserver.com\r\n";
                $ical .= "UID:" . strtoupper(md5($ical_data->id)) . "-sih.co.at\r\n";
                $ical .= "SEQUENCE:" . $ical_data->sequence . "\r\n";
                $ical .= "STATUS:" . $ical_data->status . "\r\n";
                //$ical .= "DTSTAMPTZID=Africa/Nairobi:" . date('Ymd') . 'T' . date('His') . "\r\n";
                $ical .= "DTSTART:" . $ical_data->start . "T" . $ical_data->start_time . "\r\n";
                $ical .= "DTEND:" . $ical_data->end . "T" . $ical_data->end_time . "\r\n";
                if (strlen($ical_data->venue) > 0) $ical .= "LOCATION:" . $ical_data->venue . "\r\n";
                if (strlen($ical_data->summary) > 0) $ical .= "SUMMARY:" . $ical_data->summary . "\r\n";
                if (strlen($ical_data->description) > 0) $ical .= "DESCRIPTION:" . $ical_data->description . "\r\n";
                $ical .= "BEGIN:VALARM\r\n";
                $ical .= "TRIGGER:-PT15M\r\n";
                $ical .= "ACTION:DISPLAY\r\n";
                $ical .= "DESCRIPTION:Reminder\r\n";
                $ical .= "END:VALARM\r\n";
                $ical .= "END:VEVENT\r\n";
                $ical .= "END:VCALENDAR\r\n";

                $mail->Body = $ical;
            }

            // Attachments
            foreach ($attachments as $attachment) {
                if (isset($attachment->base64) && strlen($attachment->base64) > 0) {
                    $mail->AddStringAttachment(base64_decode($attachment->base64), $attachment->name, 'base64', $attachment->type);
                } else {
                    $mail->AddAttachment(SERVER_ROOT . $attachment['path'], $attachment['name'], 'base64', $attachment['type']);
                }
            }

            foreach ($embeddedImages as $key => $image) {
                $mail->AddEmbeddedImage(SERVER_ROOT . $image, 'image_' . $key);
            }

            $result = $mail->send();

            if (FRAMEWORK['EMAIL']['ENABLE_LOG']) {
                $db->query("INSERT INTO " . FRAMEWORK['EMAIL']['TABLE_NAME'] . " (UID, from_name, from_mail, recipients, subject, message, type, ical_data, cc, bcc, attachments, embedded_images, priority, result) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                    $UID, $fromName, $fromMail, join(",", $recipients), $subject, $message, $type, $ical_data != null ? json_encode($ical_data) : null, count($cc) > 0 ? join(",", $cc) : null, count($bcc) > 0 ? join(",", $bcc) : null, count($attachments), count($embeddedImages), $priority, $result
                ]);
            }

            return $result;
        } catch (Exception $e) {
            Debug("Message could not be sent. Mailer Error: $mail->ErrorInfo", DEBUGTYPE_ERROR);
            return "Message could not be sent. Mailer Error: $mail->ErrorInfo";
        }
    }
}
