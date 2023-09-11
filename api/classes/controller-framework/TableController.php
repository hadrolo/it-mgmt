<?php

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class Table extends Controller {

    private $dbName;

    public function __construct(Database $database = null, $data = null, $componentName = null, $methodName = null, $currentUser = null) {
        if (strpos($data->config->dataConfig->tableName, '.') !== false) {
            $parts = explode('.', $data->config->dataConfig->tableName);
            $db = strtoupper($parts[0]);
            $data->config->dataConfig->tableName = $parts[1];
        } else {
            $db = 'APP';
        }
        $this->dbName = DB[$db]['DB_NAME'];
        $database = Database::create($db);
        parent::__construct($database, $data, $componentName, $methodName, $currentUser);
    }

    private function cellColor($sheet, $cells, $color) {
        $sheet->getStyle($cells)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($color);
    }

    public function exportXLS() {
        $data = $this->prepareQueryFilter();
        $tableFields = $data[0];
        $joins = $data[1];
        $where = $data[2];
        $sql_values = $data[3];

        // get table field that is currently being ordered by
        $tableField = array_values(array_filter($this->data->config->dataConfig->tableFields, function ($tableField) {
            return $tableField->key == $this->data->config->dataConfig->order;
        }))[0];

        $tableField->table = $tableField->table ?? $this->data->config->dataConfig->tableName;

        // get data
        $entries = $this->db->query("SELECT " . $tableFields
            . "\r\nFROM " . $this->data->config->dataConfig->tableName
            . $joins
            . $where
            . "\r\nGROUP BY " . $this->data->config->dataConfig->tableName . "." . $this->data->config->dataConfig->tableIndexName
            . "\r\nORDER BY " . (isset($tableField->subquery) ? $tableField->key : ($tableField->table . '.' . $tableField->name)) . ($this->data->config->dataConfig->reverse == true ? " DESC" : " ASC"),
            $sql_values);

        $trans = Translation::getAll($this->data->config->language);

        // create excel
        $spreadsheet = new Spreadsheet();

        $spreadsheet->getProperties()->setCreator($this->data->config->title)
            ->setLastModifiedBy($this->data->config->title)
            ->setTitle($this->data->config->title);

        $sheet = $spreadsheet->getActiveSheet();

        $sheet->setTitle($this->data->config->title);

        // create headers
        $headers = [];
        foreach($this->data->config->dataConfig->tableFields as $tableField) {
            $headers[] = $tableField->title;
        }

        // center every title field
        foreach ($headers as $key => $value) {
            $sheet->setCellValueByColumnAndRow($key + 1, 1, $value);
            $sheet->getStyle(Coordinate::stringFromColumnIndex($key + 1) . "1")->getAlignment()->applyFromArray(
                [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER
                ]
            );
        }

        foreach ($entries['data'] as $key => $entry) {
            $column_index = 1;
            foreach($entry as $key_column => $column) {
                // skip index
                if ($key_column !== $this->data->config->dataConfig->tableIndexName) {

                    // get table field
                    $tableField = array_values(array_filter($this->data->config->dataConfig->tableFields, function ($tableField) use ($key_column) {
                        return $tableField->key == $key_column;
                    }))[0];

                    // translate field
                    if (isset($tableField->translate) && $tableField->translate == 1) {

                        // split prefix into parts
                        $parts = explode(".", $tableField->translateValuePrefix);
                        if (count($parts) == 1) {
                            $value = $trans->{$tableField->translateValuePrefix}->{$column};
                        } else if (count($parts) == 2) {
                            $value = $trans->{$parts[0]}->{$parts[1]}->{$column};
                        }
                    } else {
                        $value = $column;
                    }

                    $sheet->setCellValueByColumnAndRow($column_index, $key + 2, $value);
                }
                $column_index++;
            }
        }

        // various formatting
        $sheet->setAutoFilter("A1:" . Coordinate::stringFromColumnIndex(sizeof($headers)) . "1");
        $sheet->getRowDimension('1')->setRowHeight(40);
        $this->cellColor($sheet, "A1:" . Coordinate::stringFromColumnIndex(sizeof($headers)) . "1", 'eeeeee');

        $sheet->freezePane('A2');

        foreach ($headers as $key => $value) {
            $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($key + 1))->setAutoSize(true);
        }

        // Write
        $writer = new Xlsx($spreadsheet);

        $path = FRAMEWORK['FILE']['GLOBAL']['PATH'] . "download" . DIRECTORY_SEPARATOR;
        // create folder if it does not exist already
        if (!is_dir($path)) {
            mkdir($path, 0755, true);
        }

        $filename = $this->data->config->title . "_Export_" . date("d.m.Y_H.i") . ".xlsx";
        $writer->save($path . $filename);

        // get file, encode as base64 and delete it
        $data = base64_encode(file_get_contents($path . $filename));
        unlink($path . $filename);

        $this->response = [
            "path" => $filename,
            "data" => $data
        ];
    }

    /**
     * Gets database type and constraints for every field
     */
    public function getTableInfo() {

        // aggregate table names
        $tables = [];
        foreach ($this->data->config->dataConfig->tableFields as $tableField) {
            $table = $tableField->table ?? $this->data->config->dataConfig->tableName;
            if (!in_array($table, $tables) && !isset($tableField->database)) $tables[] = $table;
        }

        $columns = $this->db->getFieldInfos($this->dbName, $tables);

        foreach ($this->data->config->dataConfig->tableJoins as $join) {
            $ex = explode('.', $join->left);
            if (count($ex) > 1) {
                $columns = array_merge($columns, $this->db->getFieldInfos($ex[0], [$ex[1]]));
            }
        }

        // check for duplicate keys in table fields config
        $fieldFound = [];
        foreach ($this->data->config->dataConfig->tableFields as $key => $tableField) {
            if (!array_key_exists($tableField->key, $fieldFound)) {
                $fieldFound[$tableField->key] = $tableField;
            } else {
                debug('Duplicate table field key found: ' . $tableField->key . ' in config: "' . $this->data->config->title . '"', DEBUGTYPE_ERROR);
            }
        }

        $tableFields = [];
        foreach ($this->data->config->dataConfig->tableFields as $key => $tableField) {
            if (isset($tableField->name)) {
                $column = array_values(array_filter($columns, function ($column) use ($tableField) {
                    return $column['COLUMN_NAME'] == $tableField->name && $column['TABLE_NAME'] == ($tableField->table ?? $this->data->config->dataConfig->tableName);
                }));

                if (count($column) == 1) {
                    $tableFields[$tableField->key] = [
                        "_DB_type_name" => $column[0]['DATA_TYPE'],
                        "_DB_type_constraints" => $column[0]['type_constraints'],
                    ];
                } else {
                    debug('Column "' . $tableField->name . '" does not exist in table "' . ($tableField->table ?? $this->data->config->dataConfig->tableName)
                        . '" in config: "' . $this->data->config->title . '"', DEBUGTYPE_ERROR);
                }
            } else {
                $tableFields[$tableField->key] = [
                    "_DB_type_name" => null, // when using alias
                    "_DB_type_constraints" => null,
                ];
            }
        }

        $this->response->tableFields = $tableFields;
    }

    public function groupAlpha() {
        $data = $this->prepareQueryFilter();
        $joins = $data[1];
        $sql_where = $data[2];
        $sql_values = $data[3];

        // get the table field which is currently being ordered by
        $tableField = array_values(array_filter($this->data->config->dataConfig->tableFields, function ($tableField) {
            return $tableField->key == $this->data->config->dataConfig->order;
        }))[0];

        if (isset($tableField->subquery)) {
            $substring = $tableField->subquery;
        } else {
            $substring = ($tableField->table ?? $this->data->config->dataConfig->tableName) . "." . $tableField->name;
        }

        if (isset($tableField->_DB_type_name) && in_array($tableField->_DB_type_name, ["date", "datetime", "timestamp"]) && isset($tableField->dateFormat)) {
            $this->response->alpha = $this->db->query("SELECT SUBSTRING(DATE_FORMAT(" . ($tableField->table ?? $this->data->config->dataConfig->tableName) . "." . $tableField->name . ", '" . $tableField->dateFormat->others . "'), 9, 1) AS sortIndexName "
                . " FROM " . $this->data->config->dataConfig->tableName
                . $joins
                . $sql_where
                . "\r\n\tAND " . $substring . " IS NOT NULL"
                . "\r\nGROUP BY sortIndexName"
                . "\r\nORDER BY sortIndexName",
                $sql_values
            );
        } else {
            $this->response->alpha = $this->db->query("SELECT " . (isset($tableField->translate) ? $substring : ("SUBSTRING(" . $substring . ", 1, 1)")) . " AS sortIndexName"
                . " FROM " . $this->data->config->dataConfig->tableName
                . $joins
                . $sql_where
                . "\r\n\tAND " . $substring . " IS NOT NULL"
                . "\r\nGROUP BY sortIndexName"
                . "\r\nORDER BY sortIndexName",
                $sql_values
            );
        }

        if (isset($this->data->config->alphalistOverlay)) {
            $this->response->alphalist = $this->data->config->alphalistOverlay;
        } else {
            $this->response->alphalist = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        }
    }

    public function listAll() {
        $data = $this->prepareQueryFilter();
        $tableFields = $data[0];
        $joins = $data[1];
        $where = $data[2];
        $sql_values = $data[3];

        // get table field that is currently being ordered by
        $tableField = array_values(array_filter($this->data->config->dataConfig->tableFields, function ($tableField) {
            return $tableField->key == $this->data->config->dataConfig->order;
        }))[0];

        $tableField->table = $tableField->table ?? $this->data->config->dataConfig->tableName;

        // create alphafilter depending on translation setting
        if (isset($tableField->translate) && $tableField->translate == 1) {
            // if (!isset($tableField->subquery)) { //todo: check
                $labels = [];
                foreach ($tableField->_DB_type_constraints_translated as $key => $value) {
                    if (stripos($value, $this->data->config->dataConfig->alphaFilter) === 0) {
                        $labels[] = $key;
                    };
                }
                if (isset($tableField->subquery)) {
                    if (count($labels) > 0) {
                        $where .= ($this->data->config->dataConfig->alphaFilter != '' ? "\r\n\tAND " . $tableField->subquery . " IN ('" . join("','", $labels) . "')" : "");
                    }
                } else {
                    if (count($labels) > 0) {
                        $where .= ($this->data->config->dataConfig->alphaFilter != '' ? "\r\n\tAND " . $tableField->table . '.' . $tableField->name . " IN ('" . join("','", $labels) . "')" : "");
                    }
                }
           // }
        } else {
            if (isset($tableField->_DB_type_name) && $tableField->_DB_type_name == 'date') {
                if (isset($tableField->subquery)) {
                    $where .= ($this->data->config->dataConfig->alphaFilter != '' ? "\r\n\tAND SUBSTRING(" . $tableField->subquery . ",9,1) LIKE '" . $this->data->config->dataConfig->alphaFilter . "%'" : "");
                } else {
                    $where .= ($this->data->config->dataConfig->alphaFilter != '' ? "\r\n\tAND SUBSTRING(" . $tableField->table . '.' . $tableField->name . ",9,1) LIKE '" . $this->data->config->dataConfig->alphaFilter . "%'" : "");
                }
            } else {
                if (isset($tableField->subquery)) {
                    $where .= ($this->data->config->dataConfig->alphaFilter != '' ? "\r\n\tAND " . $tableField->subquery . " LIKE '" . $this->data->config->dataConfig->alphaFilter . "%'" : "");
                } else {
                    $where .= ($this->data->config->dataConfig->alphaFilter != '' ? "\r\n\tAND " . $tableField->table . '.' . $tableField->name . " LIKE '" . $this->data->config->dataConfig->alphaFilter . "%'" : "");
                }
            }
        }

        // get data
        $this->response->table = $this->db->query("SELECT " . $tableFields
            . "\r\nFROM " . $this->data->config->dataConfig->tableName
            . $joins
            . $where
            . "\r\nGROUP BY " . $this->data->config->dataConfig->tableName . "." . $this->data->config->dataConfig->tableIndexName
            . "\r\nORDER BY " . (isset($tableField->subquery) ? $tableField->key : ($tableField->table . '.' . $tableField->name)) . ($this->data->config->dataConfig->reverse == true ? " DESC" : " ASC")
            . "\r\nLIMIT " . $this->data->config->paginConfig->itemsPerPage
            . "\r\nOFFSET " . ($this->data->config->paginConfig->currentPage * $this->data->config->paginConfig->itemsPerPage - $this->data->config->paginConfig->itemsPerPage),
            $sql_values);


        // get data count
        $this->response->total = $this->db->query("SELECT \r\n\t" . $this->data->config->dataConfig->tableName . "." . $this->data->config->dataConfig->tableIndexName . "," . $tableFields
            . "\r\nFROM " . $this->data->config->dataConfig->tableName
            . $joins
            . $where
            . "\r\nGROUP BY " . $this->data->config->dataConfig->tableName . "." . $this->data->config->dataConfig->tableIndexName
            , $sql_values
        )['count'];

        // get sums
        foreach ($this->data->config->dataConfig->tableFields as $tableField) {
            if (isset($tableField->footerSum)) {
                $this->response->footerSums[$tableField->key] = $this->db->query("SELECT SUM(" . $tableField->name . ") AS sum"
                    . "\r\nFROM " . $this->data->config->dataConfig->tableName
                    . $joins
                    . $where
                    , $sql_values
                )['data'][0]['sum'];
            };
        }

        $this->getFilterSelects($joins, $where, $sql_values);
    }

    private function getFilterSelects(string $joins, string $where, array $sql_values) {
        if ($this->data->config->dataConfig->columnFilter->enabled == 1 && $this->data->config->dataConfig->columnFilter->active == 1) {
            foreach ($this->data->config->dataConfig->columnFilter->fields as $key => $columnFilterField) {

                foreach ($this->data->config->dataConfig->tableFields as $tableField) {
                    if ($tableField->key == $key) {

                        if (isset($tableField->name)) {
                            $table_field = ($tableField->table ?? $this->data->config->dataConfig->tableName) . "." . $tableField->name;
                            $table_field_alias = $table_field . " AS " . $tableField->key;
                        }

                        if ($columnFilterField->type == 'lookup') {
                            $this->response->selects[$key] = $this->db->query("SELECT " . $table_field_alias
                                . "\r\nFROM " . $this->data->config->dataConfig->tableName
                                . $joins
                                . $where
                                . "\r\nAND " . $table_field . " IS NOT NULL"
                                . "\r\nGROUP BY " . $tableField->table . "." . $tableField->index
                                . "\r\nORDER BY " . $table_field, $sql_values)['data'];
                        }

                        if ($columnFilterField->type == 'subquery_count') {
                            $this->response->selects[$key] = $this->db->query("SELECT " . $tableField->subquery . " AS " . $tableField->key
                                . "\r\nFROM " . $this->data->config->dataConfig->tableName
                                . $joins
                                . $where
                                . "\r\nGROUP BY " . $tableField->key
                                . "\r\nORDER BY " . $tableField->key, $sql_values)['data'];
                        }

                        if ($columnFilterField->type == 'subquery_concat') {
                            $this->response->selects[$key] = $this->db->query("SELECT " . $tableField->subquery . " AS " . $tableField->key
                                . "\r\nFROM " . $this->data->config->dataConfig->tableName
                                . $joins
                                . $where
                                . "\r\nAND " . $tableField->key . " IS NOT NULL"
                                . "\r\nGROUP BY " . $tableField->key
                                . "\r\nORDER BY " . $tableField->key, $sql_values)['data'];
                        }

                        if ($columnFilterField->type == 'subquery_group') {
                            $result = $this->db->query("SELECT " . $tableField->subquery . " AS " . $tableField->key
                                . "\r\nFROM " . $this->data->config->dataConfig->tableName
                                . $joins
                                . $where
                                . "\r\nGROUP BY " . $tableField->key
                                . "\r\nORDER BY " . $tableField->key, $sql_values
                            )['data'];
                            $this->response->selects[$key] = array_map(function ($element) use ($key, $tableField) {
                                return $element[$tableField->key];
                            }, $result);
                        }

                        if ($columnFilterField->type == 'group') {
                            $result = $this->db->query("SELECT " . $table_field_alias
                                . "\r\nFROM " . $this->data->config->dataConfig->tableName
                                . $joins
                                . $where
                                . "\r\nAND " . $table_field . " IS NOT NULL"
                                . "\r\nGROUP BY " . $table_field
                                . "\r\nORDER BY " . $table_field, $sql_values
                            )['data'];
                            $this->response->selects[$key] = array_map(function ($element) use ($key, $tableField) {
                                return $element[$tableField->key];
                            }, $result);
                        }

                        if ($columnFilterField->type == 'enum') {
                            $result = $this->db->query("SELECT " . $table_field_alias
                                . "\r\nFROM " . $this->data->config->dataConfig->tableName
                                . $joins
                                . $where
                                . "\r\nAND " . $table_field . " IS NOT NULL"
                                . "\r\nGROUP BY " . $table_field
                                . "\r\nORDER BY " . $table_field, $sql_values
                            )['data'];
                            $this->response->selects[$key] = array_map(function ($element) use ($key, $tableField) {
                                return $element[$tableField->key];
                            }, $result);
                        }

                        if ($columnFilterField->type == 'boolean') {
                            $result = $this->db->query("SELECT " . $table_field_alias
                                . "\r\nFROM " . $this->data->config->dataConfig->tableName
                                . $joins
                                . $where
                                . "\r\nAND " . $table_field . " IS NOT NULL"
                                . "\r\nGROUP BY " . $table_field
                                . "\r\nORDER BY " . $table_field, $sql_values
                            )['data'];
                            $this->response->selects[$key] = array_map(function ($element) use ($key, $tableField) {
                                return $element[$tableField->key];
                            }, $result);
                        }
                    }
                }
            }
        }
    }

    private function prepareQueryFilter(): array {
        // aggregate fields
        $tableFields = array_filter($this->data->config->dataConfig->tableFields, function ($tableField) {
            return !isset($tableField->fileViewerFID) && !isset($tableField->fileViewer);
        });

        $tableFields = join(", ", array_map(function ($tableField) {
            if (isset($tableField->subquery)) {
                return "\r\n\t" . $tableField->subquery . " AS " . $tableField->key;
            } else {
                if (isset($tableField->_DB_type_name)) {
                    if ($this->data->config->language != 'en') {
                        if (($tableField->_DB_type_name == 'date' || $tableField->_DB_type_name == 'timestamp' || $tableField->_DB_type_name == 'datetime') && isset($tableField->dateFormat->others)) {
                            return "\r\n\t" . 'DATE_FORMAT(' . ($tableField->table ?? $this->data->config->dataConfig->tableName) . "." . $tableField->name . ", '" . $tableField->dateFormat->others . "') AS " . $tableField->key;
                        }
                    } else {
                        if (($tableField->_DB_type_name == 'date' || $tableField->_DB_type_name == 'timestamp' || $tableField->_DB_type_name == 'datetime') && isset($tableField->dateFormat->en)) {
                            return "\r\n\t" . 'DATE_FORMAT(' . ($tableField->table ?? $this->data->config->dataConfig->tableName) . "." . $tableField->name . ", '" . $tableField->dateFormat->en . "') AS " . $tableField->key;
                        }
                    }
                }
                return "\r\n\t" . ($tableField->table ?? $this->data->config->dataConfig->tableName) . "." . $tableField->name . " AS " . $tableField->key;
            }
        }, $tableFields));

        // add pk index manually
        $tableFields .= ",\r\n\t" . $this->data->config->dataConfig->tableName . "." . $this->data->config->dataConfig->tableIndexName;

        // aggregate joins
        $joins = "";
        if (isset($this->data->config->dataConfig->tableJoins)) {
            $joins = join(" ", array_map(function ($element) {
                // return "\r\n\t" . "LEFT JOIN " . $element->left . " ON " . $element->left . "." . $element->key . " = " . $element->right . "." . $element->key . (isset($element->condition) ? ' ' . $element->condition : '');
                return "\r\n\t" . "LEFT JOIN " . $element->left . " ON " . $element->left . "." . $element->key . " = " . $element->right . "." . (isset($element->keyRight) ? $element->keyRight : $element->key) . (isset($element->condition) ? ' ' . $element->condition : '');
            }, $this->data->config->dataConfig->tableJoins));
        }

        // create global search string
        $sql_where = "\r\nWHERE 1 ";
        $sql_values = [];
        if (strlen($this->data->config->dataConfig->search) >= $this->data->config->dataConfig->searchMinimumCharacter) {

            $parts_where = [];
            foreach ($this->data->config->dataConfig->tableFields as $tableField) {
                if (isset($tableField->searchable) && $tableField->searchable == 1) {

                    if (isset($tableField->subquery)) {
                        $substring = $tableField->subquery;
                    } else {
                        $substring = ($tableField->table ?? $this->data->config->dataConfig->tableName) . '.' . $tableField->name;
                    }

                    if (isset($tableField->translate) && $tableField->translate == 1) {
                        if (!isset($tableField->subquery)) {
                            $labels = [];
                            foreach ($tableField->_DB_type_constraints_translated as $key => $value) {
                                if (stripos($value, $this->data->config->dataConfig->search) !== false) {
                                    $labels[] = explode(".", $key)[1];
                                };
                            }

                            if (count($labels) > 0) {
                                $parts_where[] = $substring . " IN (:" . strtoupper($tableField->key) . ")";
                                $sql_values[strtoupper($tableField->key)] = join(",", $labels);
                            }
                        }
                    } else {
                        if (isset($tableField->dateFormat) && in_array($tableField->_DB_type_name, ["date", "datetime", "timestamp"])) {
                            $parts_where[] = "DATE_FORMAT(" . ($tableField->table ?? $this->data->config->dataConfig->tableName) . "." . $tableField->name . ", '" . ($this->data->config->language == 'en' ? $tableField->dateFormat->en : $tableField->dateFormat->others) . "') LIKE :LIKESEARCH";
                        } else {
                            $parts_where[] = $substring . " LIKE :LIKESEARCH";
                        }
                    }
                }
            }

            if (count($parts_where) > 0) {
                $sql_where .= "\r\nAND (\r\n\t" . join("\r\n\tOR ", $parts_where) . "\r\n)";
            }

            $sql_values["LIKESEARCH"] = "%" . $this->data->config->dataConfig->search . "%";
        }

        // create column search strings
        if ($this->data->config->dataConfig->columnFilter->enabled == 1 && $this->data->config->dataConfig->columnFilter->active == 1) {
            $parts_where = [];
            foreach ($this->data->config->dataConfig->columnFilter->fields as $key => $columnFilterField) {

                if (strlen($columnFilterField->value) > 0) {
                    $row = array_values(array_filter($this->data->config->dataConfig->tableFields, function ($columnFilterField) use ($key) {
                        return $columnFilterField->key == $key;
                    }))[0];

                    if (isset($row->subquery)) {
                        $parts_where[] = $row->subquery . ($columnFilterField->type == 'input' ? " LIKE :" : " = :") . strtoupper($key);
                    } else {
                        if (isset($row->dateFormat) && in_array($row->_DB_type_name, ["date", "datetime", "timestamp"])) {
                            $parts_where[] = "DATE_FORMAT(" . ($row->table ?? $this->data->config->dataConfig->tableName) . "." . $row->name . ", '" . ($this->data->config->language == 'en' ? $row->dateFormat->en : $row->dateFormat->others) . "') LIKE :" . strtoupper($key);
                        } else {
                            $parts_where[] = ($row->table ?? $this->data->config->dataConfig->tableName) . "." . $row->name . ($columnFilterField->type == 'input' ? " LIKE :" : " = :") . strtoupper($key);
                        }
                    }

                    $sql_values[strtoupper($key)] = $columnFilterField->type == 'input' ? "%" . $columnFilterField->value . "%" : $columnFilterField->value;
                }
            }
            if (count($parts_where) > 0) {
                $sql_where .= "\r\nAND (\r\n\t" . join("\r\n\tAND ", $parts_where) . "\r\n)";
            }
        }

        // add table filter to 'where' string
        if (isset($this->data->config->dataConfig->tableFilter) && count($this->data->config->dataConfig->tableFilter) > 0) {
            $parts = [];
            foreach ($this->data->config->dataConfig->tableFilter as $filter) {
                foreach ($filter->values as $value) {
                    $condition = null;
                    switch ($filter->operator) {
                        case 'equal':
                            $condition = " = '" . $value . "'";
                            break;
                        case 'bigger':
                            $condition = " < '" . $value . "'";
                            break;
                        case 'smaller':
                            $condition = " > '" . $value . "'";
                            break;
                        case 'not':
                            $condition = " != '" . $value . "'";
                            break;
                        case 'is_null':
                            $condition = " IS NULL";
                            break;
                        case 'not_null':
                            $condition = " IS NOT NULL";
                            break;
                        case 'like':
                            $condition = " LIKE '%" . $value . "%'";
                            break;
                        /*                        case 'in':
                                                    $in_condition = " IN(" . $value. ")";*/
                    }
                    $parts[] = $filter->table . '.' . $filter->field . $condition;
                }
            }
            $table_filter = '(' . join(" AND ", $parts) . ')';

            $sql_where .= "\r\n\tAND " . $table_filter;
        }

        return [$tableFields, $joins, $sql_where, $sql_values];
    }
}
