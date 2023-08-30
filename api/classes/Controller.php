<?php
abstract class Controller
{

    protected $db;
    protected $data;
    protected $componentName;
    protected $methodName;
    protected $currentUser;
    protected $public_id; // UNBEDINGT NOCH ÄNDERN !!!
    protected $response;

    /**
     * Controller constructor.
     * @param Database|null $database
     * @param object|null $data
     * @param string|null $componentName
     * @param string|null $methodName
     * @param object|null $currentUser
     */
    public function __construct(Database $database = null, object $data = null, string $componentName = null, string $methodName = null, object $currentUser = null)
    {
        $this->db = $database;
        $this->data = $data;
        $this->componentName = $componentName;
        $this->methodName = $methodName;
        $this->currentUser = $currentUser;
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
