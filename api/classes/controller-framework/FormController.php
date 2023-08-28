<?php

class Form extends Controller {

    private $dbName;

    public function __construct(Database $database = null, $data = null, $componentName = null, $methodName = null, $currentUser = null) {
        if (strpos($data->config->tableName, '.') !== false) {
            $parts = explode('.', $data->config->tableName);
            $db = strtoupper($parts[0]);
            $data->config->tableName = $parts[1];
        } else {
            $db = 'DEFAULT';
        }
        $this->dbName = DB[$db]['DB_NAME'];
        $database = Database::create($db);
        parent::__construct($database, $data, $componentName, $methodName, $currentUser);
    }

    public function getFormInfo() {
        // aggregate table names
        $tables = [];
        foreach ($this->data->config->formFields as $field) {
            $table = $field->table ?? $this->data->config->tableName;
            if (!in_array($table, $tables))
                $tables[] = $table;
        }
        $columns = $this->db->getFieldInfos($this->dbName, $tables);

        $fields = [];
        $fks = [];

        foreach ($this->data->config->formFields as $key => $field) {
            // get the column matching the formField name and table
            $column = array_values(array_filter($columns, function ($column) use ($field) {
                return $column['COLUMN_NAME'] == $field->name &&
                    $column['TABLE_NAME'] == ($field->table ?? $this->data->config->tableName);

            }));

            if (count($column) > 0) {
                $pk = $this->data->config->tableIndexName;

                // get primary key of the column if another table is defined
                if (isset($field->table)) {
                    $pk = array_values(array_filter($this->data->config->formJoins, function ($join) use ($column, $field) {
                        return $join->left == $field->table;
                    }));
                    $pk = $pk[0]->key;
                }

                $constraint_type = null;
                if ($column[0]['DATA_TYPE'] == 'int' && $column[0]['COLUMN_KEY'] == 'MUL')
                    $constraint_type = 'FOREIGN KEY';

                $fields[$key] = [
                    "_DB_type_name" => $column[0]['DATA_TYPE'],
                    "_DB_type_constraints" => $column[0]['type_constraints'],
                    "_DB_required" => $column[0]['IS_NULLABLE'] == 'NO',
                    "_DB_Key" => $column[0]['COLUMN_KEY'],
                    "_DB_Default" => $column[0]['COLUMN_DEFAULT'],
                    "_DB_CONSTRAINT_TYPE" => $constraint_type,
                    "_tableIndexName" => $pk
                ];

                // if the column is a foreign key, save it
                if ($column[0]['COLUMN_KEY'] == "MUL" && $constraint_type == "FOREIGN KEY") {
                    $fks[] = $field->name;
                }
            } else {
                debug('Column "' . $field->name . '" does not exist in table "' . ($field->table ?? $this->data->config->tableName) . '"', DEBUGTYPE_ERROR);
            }
        }

        // if we have foreign keys..
        if (count($fks) > 0) {
            // .. get the table names
            $tables = $this->db->query("select tab.table_name, kcu.column_name from information_schema.tables tab
                                           left join information_schema.table_constraints tco on tab.table_name = tco.table_name and tco.constraint_type = 'PRIMARY KEY'
                                           left join information_schema.key_column_usage kcu on tco.constraint_name = kcu.constraint_name and tco.table_name = kcu.table_name
                                           WHERE kcu.column_name in ('" . join("','", $fks) . "')")['data'];

            // .. and assign the data of each table to the matching formField
            // TODO: retrieve data for m:n foreign keys
            foreach ($tables as $table) {
                foreach ($this->data->config->formFields as $key => $field) {
                    if ($field->name == $table['column_name']) {
                        $fields[$key]['_data'] = $this->db->query("SELECT * FROM " . $table['table_name'])['data'];
                    }
                }
            }
        }

        $this->response->formFields = $fields;
    }

    public function getData() {
        $fields = [];
        foreach ($this->data->config->formFields as $key => $field) {
            $fields[] = "\r\n\t" . ($field->table ?? $this->data->config->tableName) . "." . $field->name . " AS " . $key;
        }
        $fields = join(",", $fields);

        // aggregate joins
        $joins = "";
        if (isset($this->data->config->formJoins)) {
            $joins = join(" ", array_map(function ($element) {
                return "\r\n\t" . "LEFT JOIN " . $element->left . " ON " . $element->left . "." . $element->key . " = " . $element->right . "." . $element->key;
            }, $this->data->config->formJoins));
        }

        $this->response->data = $this->db->query("SELECT " . $fields . "\r\nFROM " . $this->data->config->tableName . $joins . "\r\nWHERE " . $this->data->config->tableIndexName . " = ?", [
            $this->data->config->pkValue
        ])['data'][0];
    }

    public function insertData() {
        $field_list = [];
        foreach ($this->data->config->formFields as $key => $field) {
            $field_list[$field->name] = $field->_value;
        }
        $this->response->insert = $this->db->insert(
            [
                'field_list' => $field_list,
                'table' => $this->data->config->tableName,
                'index_name' => $this->data->config->tableIndexName,
                'write_history' => true,
                'logUid' => $this->currentUser->uid,
                'logComponent' => $this->componentName,
                'logMethod' => $this->methodName
            ]
        );
    }

    public function updateData() {
        if (strlen($this->data->config->tableIndexName) > 0 &&
            strlen($this->data->config->pkValue) > 0) {

            $field_list = [];
            foreach ($this->data->config->formFields as $key => $field) {
                $field_list[$field->name] = $field->_value;
            }

            // TODO: if a formfield has a different table and index name, do multiple update calls?

            $this->response->update = $this->db->update(
                [
                    'field_list' => $field_list,
                    'table' => $this->data->config->tableName,
                    'index_name' => $this->data->config->tableIndexName,
                    'index_value' => $this->data->config->pkValue,
                    'write_history' => true,
                    'logUid' => $this->currentUser->uid,
                    'logComponent' => $this->componentName,
                    'logMethod' => $this->methodName
                ]
            );
        }
    }

    public function deleteData() {
        if (strlen($this->data->config->tableIndexName) > 0 &&
            strlen($this->data->config->pkValue) > 0) {

            $this->response->delete = $this->db->delete(
                [
                    'table' => $this->data->config->tableName,
                    'index_name' => $this->data->config->tableIndexName,
                    'index_value' => $this->data->config->pkValue,
                    'write_history' => true,
                    'logUid' => $this->currentUser->uid,
                    'logComponent' => $this->componentName,
                    'logMethod' => $this->methodName
                ]
            );
        }
    }
}
