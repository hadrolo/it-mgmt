<?php
abstract class Controller
{

    protected $db;
    protected $data;
    protected $componentName;
    protected $methodName;
    protected $currentUID;
    protected $public_id; // UNBEDINGT NOCH ÄNDERN !!!
    protected $response;

    /**
     * Controller constructor.
     * @param Database|null $database
     * @param object|null $data
     * @param string|null $componentName
     * @param string|null $methodName
     * @param int|null $currentUID
     */
    public function __construct(Database $database = null, object $data = null, string $componentName = null, string $methodName = null, int $currentUID = null)
    {
        $this->db = $database;
        $this->data = $data;
        $this->componentName = $componentName;
        $this->methodName = $methodName;
        $this->currentUID = $currentUID;
        $this->response = new stdClass();
    }

    /*
    todo: find all $this->response = and change it !
    public function getResponse(): object { */
    public function getResponse()
    {
        return $this->response;
    }
}
