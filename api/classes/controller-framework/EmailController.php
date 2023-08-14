<?php

class Email extends Controller {

    public function __construct(Database $database = null, $data = null, $componentName = null, $methodName = null, $currentUID = null) {
        $database = Database::create(FRAMEWORK['EMAIL']['DB']);
        parent::__construct($database, $data, $componentName, $methodName, $currentUID);
    }

    public function send() {
        // make sure recipients, cc and bcc are always arrays (could happen if E-Mail service is not used)
        $recipients = is_array($this->data->to) ? $this->data->to : [$this->data->to];
        $cc = (is_array($this->data->cc) ? $this->data->cc : isset($this->data->cc)) ? [$this->data->cc] : [];
        $bcc = (is_array($this->data->bcc) ? $this->data->bcc : isset($this->data->bcc)) ? [$this->data->bcc] : [];

        $this->response->message = Mail::send($this->db, $this->currentUID, $this->data->from, $this->data->from, $recipients,
        $this->data->subject, $this->data->body, $this->data->mailType, $this->data->ical ?? null,
        $cc, $bcc, $this->data->attachments ?? [], $this->data->embeddedImages ?? [], $this->data->priority ?? 3);
    }
}

