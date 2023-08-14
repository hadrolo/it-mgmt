<?php

class DatabaseServices
{
  private $host;
  private $user;
  private $pass;
  private $dbname;

  private $dbh;
  private $error;
  private $queryErrors = [];

  private $stmt;

  // constructor that initializes handler
  public function __construct($host, $user, $pass, $dbname)
  {
    $this->host = $host;
    $this->user = $user;
    $this->pass = $pass;
    $this->dbname = $dbname;

    // Set DSN (database source name)
    $dsn = 'mysql:host=' . $this->host . ';dbname=' . $this->dbname;

    // Set options
    $options = [
      PDO::ATTR_PERSISTENT => true,
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8'
    ];

    // Create a new PDO instance
    try {
      $this->dbh = new PDO($dsn, $this->user, $this->pass, $options);
    } catch (PDOException $e) {
      $this->error = $e->getMessage();
    }

  }

  public function dbh()
  {
    return $this->dbh;
  }

  public function hasErrors()
  {
    return $this->error;
  }

  public function getQueryErrors()
  {
    return $this->queryErrors;
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
    //return $this->stmt->execute($elements);
    try {
      return $this->stmt->execute($elements);
    } catch (PDOException $e) {
      return $e->getMessage();
    }
  }

  // return an array
  public function resultset()
  {
    return $this->stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  // return a single result
  public function single()
  {
    return $this->stmt->fetch(PDO::FETCH_ASSOC);
  }

  // return affected rows
  public function rowCount()
  {
    return $this->stmt->rowCount();
  }

  // last inserted id (as string)
  public function lastInsertId()
  {
    return $this->dbh->lastInsertId();
  }

  public function beginTransaction()
  {
    return $this->dbh->beginTransaction();
  }

  public function endTransaction()
  {
    return $this->dbh->commit();
  }

  public function cancelTransaction()
  {
    return $this->dbh->rollBack();
  }

  public function getQueryString()
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
   * @param array $params The array of substitution parameters
   * @return string The interpolated query
   */
  function interpolateQuery($query, $params)
  {
    $keys = [];
    $values = $params;
    # build a regular expression for each parameter
    foreach ($params as $key => $value) {
      if (is_string($key)) {
        $keys[] = '/:' . $key . '/';
      } else {
        $keys[] = '/[?]/';
      }

      if (is_string($value))
        $values[$key] = "'" . $value . "'";

      if (is_array($value))
        $values[$key] = implode(',', $value);

      if (is_null($value))
        $values[$key] = 'NULL';
    }

    $query = preg_replace($keys, $values, $query, 1, $count);

    return $query;
  }

  /**
   * Query the database (query, bind and execute).
   *
   * @param string $query
   * @param array $data
   * @return mixed
   * @author Alexander Zeillinger
   */
  function query($query, $data = null)
  {
    $query = trim($query);

    $this->prepare($query);

    if ($data) {
      for ($i = 0; $i < count($data); $i++) {
        $this->bind($i + 1, $data[$i]);
      }
    }

    $result = $this->execute();

    if ($result === true) {
      $out['data'] = [];
      if (stristr(substr($query, 0, 6), 'SELECT')) {
        $out['data'] = $this->resultset();
        $out['count'] = count($out['data']);
      } else {
        $out['affectedRows'] = $this->rowCount(); // only for DELETE, INSERT or UPDATE
      }
      if (stristr($query, "INSERT")) $out['lastID'] = $this->lastInsertId();
    } else {
      $out['error'] = $result;
      // trim spaces, tabs and newslines thx to https://stackoverflow.com/a/2326239/757218
      $this->queryErrors[] = [
        "error" => $result,
        "query" => preg_replace(array('/\s{2,}/', '/[\t\n]/'), ' ', $this->interpolateQuery($query, $data))
      ];
    }

    return $out;
  }
}
