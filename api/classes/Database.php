<?php

/**
 * Database class using PDO.
 *
 * Thx to: http://culttt.com/2012/10/01/roll-your-own-pdo-php-class/
 */
class Database
{

    private $host;
    private $user;
    private $pass;
    private $dbname;
    private $type;
    private $port;

    private $dbh;
    private $errors = null;

    /** @var PDOStatement */
    private $stmt;

    /**
     * Create a database instance with a key
     * Example: Database::create('APP')
     *
     * @param string $key
     * @return Database|null
     */
    public static function create(string $key): ?Database
    {
        if (!isset(DB[$key])) {
            debug('Database configuration for key "' . $key . '" does not exist!', DEBUGTYPE_ERROR);
            return null;
        }

        return new Database(DB[$key]['HOST'], DB[$key]['USER'], DB[$key]['PASS'], DB[$key]['DB_NAME'], DB[$key]['PORT'] ?? 3306, DB[$key]['DB_TYPE'] ?? 'mysql');
    }

    public function __construct($host, $user, $pass, $dbname, $port = 3306, $type = 'mysql')
    {

        $this->host = $host;
        $this->user = $user;
        $this->pass = $pass;
        $this->dbname = $dbname;
        $this->port = $port;
        $this->type = $type;

        // Set DSN (database source name)
        if ($this->type == 'mysql') {
            $dsn = 'mysql:host=' . $this->host . ';dbname=' . $this->dbname . ';port=' . $this->port;
            $options = [
                PDO::ATTR_PERSISTENT => true,
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8'
            ];
        } else {
            $dsn = 'sqlsrv:server=' . $this->host . ';database=' . $this->dbname;
            $options = [];
        }

        try {
            $this->dbh = new PDO($dsn, $this->user, $this->pass, $options);
        } catch (PDOException $e) {
            $this->errors[] = "PDO_ERROR";
            debug($e, DEBUGTYPE_ERROR);
        }
    }

    public function dbh(): PDO
    {
        return $this->dbh;
    }

    public function getErrors()
    {
        return $this->errors;
    }

    public function prepare($query)
    {
        $this->stmt = $this->dbh->prepare($query);
    }

    // bind value to statement
    public function bind($param, $value, $type = null)
    {
        if (is_null($type)) {
            switch (true) {
                case is_int($value):
                    $type = PDO::PARAM_INT;
                    break;
                case is_bool($value):
                    $type = PDO::PARAM_BOOL;
                    break;
                case is_null($value):
                    $type = PDO::PARAM_NULL;
                    break;
                default:
                    $type = PDO::PARAM_STR;
            }
        }
        $this->stmt->bindValue($param, $value, $type);
    }

    // execute statement
    public function execute($elements = null)
    {
        try {
            return $this->stmt->execute($elements);
        } catch (PDOException $e) {
            return [
                "message" => $e->getMessage(),
                "code" => $e->getCode()
            ];
        }
    }

    // return an array
    public function resultset(): array
    {
        return $this->stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // return a single result
    public function single()
    {
        return $this->stmt->fetch(PDO::FETCH_ASSOC);
    }

    // return affected rows
    public function rowCount(): int
    {
        return $this->stmt->rowCount();
    }

    // last inserted id (as string)
    public function lastInsertId(): string
    {
        return $this->dbh->lastInsertId();
    }

    public function beginTransaction(): bool
    {
        return $this->dbh->beginTransaction();
    }

    public function endTransaction(): bool
    {
        return $this->dbh->commit();
    }

    public function cancelTransaction(): bool
    {
        return $this->dbh->rollBack();
    }

    public function getQueryString(): string
    {
        return $this->stmt->queryString;
    }

    /**
     * Interpolates a DB query for debugging purposes.
     *
     * Replaces any parameter placeholders in a query with the value of that parameter.
     * Assumes anonymous parameters from $params are in the same order as specified in $query.
     *
     * @author http://stackoverflow.com/questions/210564/getting-raw-sql-query-string-from-pdo-prepared-statements
     * @param string $query The sql query with parameter placeholders
     * @param array|null $params The array of substitution parameters
     * @return string The interpolated query
     */
    function interpolateQuery(string $query, array $params = null): string
    {
        if ($params != null) {
            $keys = [];
            $values = $params;
            $named = false;
            # build a regular expression for each parameter
            foreach ($params as $key => $value) {
                if (is_string($key)) {
                    $keys[] = '/:' . $key . '/';
                    $named = true;
                } else {
                    $keys[] = '/[?]/';
                }

                if (is_string($value)) $values[$key] = "'" . $value . "'";

                if (is_array($value)) $values[$key] = implode(',', $value);

                if (is_null($value)) $values[$key] = 'NULL';

                if (ENVIRONMENT == 'local') {
                    $values[$key] = "\e[0m\e[1;32m" . $values[$key] . "\e[0m\e[1;34m";
                }
            }
            $query = preg_replace($keys, $values, $query, $named ? -1 : 1, $count);
        }

        if (ENVIRONMENT == 'local') {
            $query = "\r\n\e[0m\e[1;34m" . $query . "\e[0m";
        } else {
            $query = str_ireplace(["\r", "\n", "\t"], '', $query);
        }

        return $query;
    }

    /**
     * Query the database (query, bind and execute).
     *
     * @param string $query
     * @param array|null $data
     * @return array
     */
    function query(string $query, array $data = null): array
    {
        global $request_info;

        $query = trim($query);
        $this->prepare($query);

        if ($data) {
            preg_match_all('/:\w+/', $query, $matches);
            $keys_not_found_data = [];
            $keys_not_found_query = [];
            foreach ($data as $key => $value) {
                if (is_string($key)) {
                    if (array_search(":" . $key, $matches[0]) === false) {
                        $keys_not_found_data[] = $key;
                    }

                    if (strpos($query, ":" . $key) === false) {
                        $keys_not_found_query[] = $key;
                    } else {
                        $this->bind($key, $value);
                    }
                } else {
                    $this->bind($key + 1, $value);
                }
            }

            if (count($keys_not_found_query) > 0) debug("Keys not found in query: " . join(", ", $keys_not_found_query), DEBUGTYPE_INFO);
            if (count($keys_not_found_data) > 0) debug('Keys not found in data: ' . join(",", $keys_not_found_data), DEBUGTYPE_ERROR);
        }

        $result = $this->execute();

        if ($result === true) {
            if (stristr(substr($query, 0, 6), 'SELECT') || stristr(substr($query, 0, 4), 'SHOW')) {
                $out['data'] = $this->resultset();
                $out['count'] = count($out['data']);
            } else {
                $out['affectedRows'] = $this->rowCount(); // only for DELETE, INSERT or UPDATE
            }
            if (stristr($query, "INSERT")) $out['lastID'] = $this->lastInsertId();

            if (FW_LOG_QUERIES) {
                $bt = debug_backtrace();
                debug(str_replace($_SERVER['DOCUMENT_ROOT'] . DIRECTORY_SEPARATOR, '', $bt[0]['file']) . ' (' . $bt[0]['line'] . ') - ' . (isset($bt[1]) ? $bt[1]['function'] . '()' : '') . print_r($this->interpolateQuery(trim(preg_replace('/ {2,}/', '', $query)), $data), true));
            }

        } else {
            $out['error'] = $result['message'];

            if (is_null($this->errors)) $this->errors = [];

            if ((isset($request_info['universetype']) && strtoupper($request_info['universetype']) == 'SYSADMIN') ||
                (isset($request_info['usertype']) && strtoupper($request_info['usertype']) == 'SYSADMIN')) {
                $error_code = $result['message'];
            } else {
                $error_code = 'FW.ERRORS.DB';
            }

            if (!in_array($error_code, $this->errors)) $this->errors[] = $error_code;

            if (FW_LOG_QUERIES) {
                $bt = debug_backtrace()[0];
                debug(str_replace($_SERVER['DOCUMENT_ROOT'] . DIRECTORY_SEPARATOR, '', $bt['file']) . ' (' . $bt['line'] . ')');
                debug('ERROR: ' . print_r([
                        "error" => $result['message'],
                        "query" => preg_replace(array('/\s{2,}/', '/[\t\n]/'), ' ', $this->interpolateQuery($query, $data))
                    ], true), DEBUGTYPE_ERROR);
            }

            $this->writeLog(
                $request_info['currentUID'],
                'exception',
                json_encode($result['message']),
                $request_info['component'],
                $request_info['method'],
                $request_info['action']
            );
        }

        return $out;
    }

    /**
     * Update row field by field
     *
     * @param array $settings
     * @return array
     */
    public function update(array $settings): array
    {
        $updates = [];
        $updatedFields = [];
        $errors = [];

        if (!isset($settings['output_update'])) $settings['output_update'] = true;

        foreach ($settings['field_list'] as $fieldname => $fieldvalue) {

            // eg. empty date value needs to be null to be saved
            if ($fieldvalue === "") $fieldvalue = null;

            //if ($fieldvalue !== null) {
            if ($fieldvalue == null) {
                $result = $this->query("UPDATE " . $settings['table'] . " SET " . $fieldname . " = ? WHERE " . $settings['index_name'] . " = ? AND "
                    . $fieldname . " IS NOT NULL", [$fieldvalue, $settings['index_value']]);
            } else {
                $result = $this->query("UPDATE " . $settings['table'] . " SET " . $fieldname . " = ? WHERE " . $settings['index_name'] . " = ? AND (" . $fieldname . " != ? OR "
                    . $fieldname . " IS NULL)", [$fieldvalue, $settings['index_value'], $fieldvalue]);
            }

            if (!isset($result['error']) && $result['affectedRows'] != 0) {
                $updates[$fieldname] = $fieldname === 'password' ? '********' : $fieldvalue;
                $updatedFields[] = $fieldname;
            } else {
                if (isset($result['error'])) {
                    $errors[] = $result['error'];
                    $this->writeLog(
                        $settings['logUid'],
                        'error',
                        json_encode($result['error']) . '::' . $settings['index_name'] . "=" . $settings['index_value'],
                        $settings['logComponent'],
                        $settings['logMethod'],
                        'update()');
                }
            }
            //}
        }

        // write to history
        if (count($updates) > 0 && $settings['write_history'] === true) {
            $this->query("INSERT INTO " . FRAMEWORK['HISTORY']['TABLE_NAME'] . " (UID, FK_ID, FK_name, FK_table, created, type, data) VALUES (?, ?, ?, ?, NOW(), ?, ?)",
                [$settings['logUid'], $settings['index_value'], $settings['index_name'], $settings['table'], 'update', json_encode($updates)]
            );
        }

        return [
            "update" => count($errors) == 0,
            "index_name" => $settings['index_name'],
            "index" => $settings['index_value'],
            "updatedFields" => $updatedFields,
            "errors" => $errors,
            "output_update" => $settings['output_update']
        ];
    }

    /**
     * Insert row
     *
     * @param array $settings
     * @return array
     */
    public function insert(array $settings): array
    {
        $fields = [];
        $wildcards = [];
        $values = [];

        $inserts = [];
        $errors = [];

        if (!isset($settings['output_insert'])) $settings['output_insert'] = true;

        foreach ($settings['field_list'] as $fieldname => $fieldvalue) {
            if ($fieldvalue !== "") {
                $fields[] = $fieldname;
                $values[] = $fieldvalue;
                $wildcards[] = '?';
            }
        }

        $result = $this->query("INSERT INTO " . $settings['table'] . " (" . join(",", $fields) . ") VALUES (" . join(",", $wildcards) . ")", $values);

        if (!isset($result['error'])) {
            $lastInsertId = $this->lastInsertId();

            if ($settings['write_history'] === true) {
                foreach ($fields as $key => $fieldname) {
                    $inserts[$fieldname] = $fieldname === 'password' ? "********" : $values[$key];
                }

                // write to history
                $this->query("INSERT INTO " . FRAMEWORK['HISTORY']['TABLE_NAME'] . " (UID, FK_ID, FK_name, FK_table, created, type, data) VALUES (?, ?, ?, ?, NOW(), ?, ?)",
                    [$settings['logUid'], $lastInsertId, $settings['index_name'], $settings['table'], 'insert', json_encode($inserts)]
                );
            }

            return ["insert" => true, "index_name" => $settings['index_name'], "index" => $lastInsertId, "output_insert" => $settings['output_insert']];
        } else {
            $errors[] = $result['error'];
            $this->writeLog(
                $settings['logUid'],
                'error',
                json_encode($errors),
                $settings['logComponent'],
                $settings['logMethod'],
                'insert()');
            return ["insert" => false, "index_name" => $settings['index_name'], "output_insert" => $settings['output_insert'], "errors" => $errors];
        }
    }

    /**
     * Delete a row - version with params // TODO: evaluate with EHA (AZE)
     *
     * @param string $table
     * @param string $index_name
     * @param $index_value
     * @param bool $write_history
     * @return array
     */
    public function delete_new(string $table, string $index_name, $index_value, bool $write_history = false): array
    {
        global $request_info;

        return $this->delete([
            'table' => $table,
            'index_name' => $index_name,
            'write_history' => $write_history,
            'index_value' => $index_value,
            'logUid' => $request_info['currentUID'],
            'logComponent' => $request_info['component'],
            'logMethod' => $request_info['method'],
        ]);
    }

    /**
     * Delete row
     *
     * @param array $settings
     * @return array
     */
    public function delete(array $settings): array
    {
        $errors = [];
        $deletes = [];

        if (!isset($settings['output_delete'])) $settings['output_delete'] = true;

        if (strlen($settings['index_value']) > 0) {
            $resultDeletes = $this->query("SELECT * FROM " . $settings['table'] . " WHERE " . $settings['index_name'] . "=?", [$settings['index_value']])['data'][0];
            foreach ($resultDeletes as $key => $value) {
                $deletes[$key] = $key === 'password' ? "********" : $value;
            }

            if (isset($settings['check_field']) && isset($settings['check_id'])) {
                $result = $this->query("DELETE FROM " . $settings['table'] . " WHERE " . $settings['index_name'] . "=? AND " . $settings['check_field'] . "=?", [$settings['index_value'], $settings['check_id']]);
            } else {
                $result = $this->query("DELETE FROM " . $settings['table'] . " WHERE " . $settings['index_name'] . "=?", [$settings['index_value']]);
            }

            if (!isset($result['error'])) {
                // write to history
                if ($settings['write_history'] === true) {
                    $this->query("INSERT INTO " . FRAMEWORK['HISTORY']['TABLE_NAME'] . " (UID, FK_ID, FK_name, FK_table, created, type, data) VALUES (?, ?, ?, ?, NOW(), ?, ?)",
                        [$settings['logUid'], $settings['index_value'], $settings['index_name'], $settings['table'], 'delete', json_encode($deletes)]
                    );
                }
                return ["delete" => true, "index_name" => $settings['index_name'], "index" => $settings['index_value'], "output_delete" => $settings['output_delete']];
            } else {
                $errors[] = $result['error'];
                $this->writeLog(
                    $settings['logUid'],
                    'error',
                    json_encode($errors),
                    $settings['logComponent'],
                    $settings['logMethod'],
                    'delete()');
                return ["delete" => false, "index_name" => $settings['index_name'], "index" => $settings['index_value'], "output_delete" => $settings['output_delete'], "errors" => $errors];
            }
        } else {
            $errors[] = 'Index Field ' . $settings['index_name'] . ' !>0';
            $this->writeLog(
                $settings['logUid'],
                'error',
                json_encode($errors),
                $settings['logComponent'],
                $settings['logMethod'],
                'delete()');
            return ["delete" => false, "index_name" => $settings['index_name'], "index" => $settings['index_value'], "output_delete" => $settings['output_delete'], "errors" => $errors];
        }
    }

    /**
     * @param string $dbName
     * @param array $tableNames
     * @return array
     */
    public function getFieldInfos(string $dbName, array $tableNames): array
    {

        $columns = $this->query("SELECT
            tab.TABLE_NAME,
            tab.COLUMN_NAME,
            tab.COLUMN_DEFAULT,
            tab.COLUMN_TYPE,
            tab.IS_NULLABLE,
            tab.DATA_TYPE,
            tab.CHARACTER_MAXIMUM_LENGTH,
            tab.COLUMN_KEY,
            tab.COLUMN_COMMENT
            FROM information_schema.columns AS tab
            WHERE TABLE_SCHEMA = '" . $dbName . "' AND tab.table_name IN ('" . join("','", $tableNames) . "')")['data'];

        // split COLUMN_TYPE into name and constraints
        foreach ($columns as &$column) {
            if (strpos($column['COLUMN_TYPE'], "(") !== false) {
                $parts = explode("(", $column['COLUMN_TYPE']);

                $constraints = substr($parts[1], 0, -1);
                $column['type_constraints'] = $parts[0] == "enum" ? explode(",", str_replace("'", "", $constraints)) : $constraints;
            } else {
                $column['type_constraints'] = null;
            }
        }
        unset($column);

        return $columns;
    }

    private function writeLog($uid, $type, $text, $component, $method, $action): void
    {
        Log::write(
            $uid,
            $type,
            $text,
            $component,
            $method,
            'Database.php',
            $action
        );
    }

    public function checkValueExist($var, $message)
    {
        if (!isset($var)) {
            if (API_ERROR_MISSING_VARIABLES) {
                $error = $message;
                $this->writeError($error);
            }
            return false;
        };
    }

    public function writeError($message)
    {
        if (API_ERROR) {
            return $this->errors[] = $message;
        }
    }
}
