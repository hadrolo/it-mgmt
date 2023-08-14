<?php

/*
 * upload_max_filesize = 40M
 * post_max_size = 40M
 * memory_limit = 256
 */

class File extends Controller
{

    public function __construct(Database $database = null, $data = null, $componentName = null, $methodName = null, $currentUID = null)
    {
        $database = Database::create(FRAMEWORK['FILE']['GLOBAL']['DB']);
        parent::__construct($database, $data, $componentName, $methodName, $currentUID);

        if ($this->data && (property_exists($this->data, 'upload_post'))) {
            $this->data->doctype = $this->data->upload_post['doctype'];
            $this->data->fk_id = $this->data->upload_post['fk_id'];
            $this->data->fk_name = $this->data->upload_post['fk_name'];
            $this->data->fk_table = $this->data->upload_post['fk_table'];
            $this->data->displayNames = $this->data->upload_post['display_names'];
        }
    }

    /**
     * Returns the real path of a file.
     * Takes into account the image_size (orig, thumb, s, m, l, xl) and encryption.
     *
     * @param string $image_size
     * @param string $path
     * @param string $name
     * @param string $extension
     * @param string $encrypted either '1' or '0'
     * @return string
     */
    private function getRealFilePath(string $image_size, string $path, string $name, string $extension, string $encrypted): string
    {
        $realpath = FRAMEWORK['FILE']['GLOBAL']['PATH'] . str_replace('/', DIRECTORY_SEPARATOR, $path) . $name;

        if ($image_size != 'orig') {
            $realpath .= "_" . $image_size;
        }

        $realpath .= "." . $extension;

        if ($encrypted == '1') {
            $realpath .= '.enc';
        }

        return $realpath;
    }

    private function isImage($element): bool
    {
        return substr($element['mimetype'], 0, 5) == 'image';
    }

    /**
     * Returns a placeholder image as Base64 string.
     *
     * @param string $extension
     * @return string
     */
    public function getMimeImage(string $extension): string
    {
        $mimeLookup = [
            "ai" => "ai.png",
            "avi" => "avi.png",
            "css" => "css.png",
            "csv" => "csv.png",
            "dbf" => "dbf.png",
            "doc" => "doc.png",
            "docx" => "doc.png",
            "exe" => "exe.png",
            "fla" => "fla.png",
            "html" => "html.png",
            "iso" => "iso.png",
            "js" => "js.png",
            "mp3" => "mp3.png",
            "mp4" => "mp4.png",
            "pdf" => "pdf.png",
            "psd" => "psd.png",
            "rtf" => "rtf.png",
            "txt" => "txt.png",
            "xml" => "xml.png",
            "xlsx" => "xml.png",
            "zip" => "zip.png",
            "missing" => "missing.png"
        ];
        $image = key_exists($extension, $mimeLookup) ? $mimeLookup[$extension] : 'file.png';
        return 'data:image/png;base64,' . base64_encode(file_get_contents(FRAMEWORK['FILE']['GLOBAL']['PATH_MIME_PICS'] . $image));
    }

    public function rotateImageSet()
    {
        $file = $this->db->query("SELECT doctype, path, name, extension, mimetype, encrypted, width, height FROM " . FRAMEWORK['FILE']['GLOBAL']['TABLE_NAME'] . " WHERE FID = ?", [$this->data->FID])['data'][0];

        // check if the file is an image
        if (in_array($file['mimetype'], ['image/png', 'image/jpeg', 'image/gif'])) {
            foreach (FRAMEWORK['FILE']['DOCTYPES'][$file['doctype']]['IMAGE_RESIZE'] as $image_size) {
                $realpath = $this->getRealFilePath($image_size, $file['path'], $file['name'], $file['extension'], $file['encrypted']);

                $this->rotateImage($realpath, $file['mimetype'], $file['encrypted'], $this->data->degrees);
            }

            $this->db->query('UPDATE ' . FRAMEWORK['FILE']['GLOBAL']['TABLE_NAME'] . ' SET width = ?, height = ? WHERE FID = ?', [$file['height'], $file['width'], $this->data->FID]);
            $this->response->rotate = true;
        } else {
            debug("Rotate: File is not an image!", DEBUGTYPE_WARNING);
            $this->response->rotate = false;
        }
    }

    /**
     * Rotates a single image.
     *
     * @param string $filename
     * @param string $mimetype
     * @param string $encrypted
     * @param float $degrees
     */
    private function rotateImage(string $filename, string $mimetype, string $encrypted, float $degrees): void
    {
        $newImage = null;

        if ($mimetype === 'image/png') {
            $newImage = $encrypted == '1' ? imagecreatefromstring($this->decrypt(file_get_contents($filename))) : imagecreatefrompng($filename);
            if (unlink($filename) == true) {
                if ($encrypted == '1') {
                    ob_start();

                    imagepng(imagerotate($newImage, $degrees, 0));
                    file_put_contents(
                        $filename,
                        $this->encrypt(ob_get_contents())
                    );
                    ob_end_clean();
                } else {
                    imagepng(imagerotate($newImage, $degrees, 0), $filename);
                }
            }
        }
        if ($mimetype === 'image/jpeg') {
            $newImage = $encrypted == '1' ? imagecreatefromstring($this->decrypt(file_get_contents($filename))) : imagecreatefromjpeg($filename);
            if (unlink($filename) == true) {
                if ($encrypted == '1') {
                    ob_start();
                    imagejpeg(imagerotate($newImage, $degrees, 0));
                    file_put_contents(
                        $filename,
                        $this->encrypt(ob_get_contents())
                    );
                    ob_end_clean();
                } else {
                    imagejpeg(imagerotate($newImage, $degrees, 0), $filename);
                }
            }
        }
        if ($mimetype === 'image/gif') {
            $newImage = $encrypted == '1' ? imagecreatefromstring($this->decrypt(file_get_contents($filename))) : imagecreatefromgif($filename);
            if (unlink($filename) == true) {
                if ($encrypted == '1') {
                    ob_start();
                    imagegif(imagerotate($newImage, $degrees, 0));
                    file_put_contents(
                        $filename,
                        $this->encrypt(ob_get_contents())
                    );
                    ob_end_clean();
                } else {
                    imagegif(imagerotate($newImage, $degrees, 0), $filename);
                }
            }
        }
    }

    public function getUploadMaxFilesize()
    {
        $this->response->upload_max_filesize = ini_get('upload_max_filesize');
        $this->response->post_max_size = ini_get('post_max_size');
    }

    /*public function checkPicExist() {
        $this->response->filename = FRAMEWORK['FILE']['GLOBAL']['PATH'] . $this->data->filename;
        if (strlen($this->data->filename) > 0) {
            $this->response->picexist = file_exists(DATA_PATH . $this->data->filename);
        } else {
            $this->response->picexist = false;
        }
    }*/

    public function countAlreadyUploaded()
    {
        $this->response->uploaded = $this->db->query("SELECT COUNT(*) AS count FROM " . FRAMEWORK['FILE']['GLOBAL']['TABLE_NAME'] . " WHERE FK_NAME = ? AND FK_ID = ? AND FK_TABLE = ? AND doctype = ?",
            [$this->data->fk_name, $this->data->fk_id, $this->data->fk_table, $this->data->doctype])['data'][0]['count'];
    }

    public function getFile()
    {
        $res = $this->db->query("SELECT"
            . (strlen(FRAMEWORK['AUTH']['MODULES']['DEFAULT']['FIELD_LOGIN']) > 0 ? " u." . FRAMEWORK['AUTH']['MODULES']['DEFAULT']['FIELD_LOGIN'] . "," : "")
            . " u.firstname, u.lastname, f.*"
            . " FROM " . FRAMEWORK['FILE']['GLOBAL']['TABLE_NAME'] . " AS f"
            . " LEFT JOIN " . FRAMEWORK['AUTH']['MODULES']['DEFAULT']['DB'] . "." . FRAMEWORK['AUTH']['MODULES']['DEFAULT']['TABLE_NAME'] . " AS u ON u.UID = f.create_UID"
            . " WHERE f.FID = ?", [$this->data->FID]);

        if ($res['count'] > 0) {
            $file = $res['data'][0];
        } else {
            debug('error - FID ' . $this->data->FID . ' does not exist in files table', DEBUGTYPE_ERROR);
            return;
        }

        if ($this->data->thumbnail && $this->isImage($file)) {
            $realpath = $this->getRealFilePath('thumb', $file['path'], $file['name'], $file['extension'], $file['encrypted']);
        } else {
            $realpath = $this->getRealFilePath('orig', $file['path'], $file['name'], $file['extension'], $file['encrypted']);
        }

        $file_data = file_get_contents($realpath);

        $this->response->file = $file;
        if ($this->isImage($file)) {
            $this->response->imageData = $file['imgData'] = 'data:' . $file['mimetype'] . ';base64,' . base64_encode($file['encrypted'] == '1' ? $this->decrypt($file_data) : $file_data);
            $this->response->fileData = null;
            $this->response->isImage = true;
        } else {
            $this->response->imageData = $this->getMimeImage($file['extension']);
            $this->response->fileData = $file['imgData'] = 'data:' . $file['mimetype'] . ';base64,' . base64_encode($file['encrypted'] == '1' ? $this->decrypt($file_data) : $file_data);
            $this->response->isImage = false;
        }
    }

    /**
     * Loads all files including userinfo and thumbnail/mimeImage
     */
    public function listUploadedFiles()
    {
        $this->response->files = $this->db->query("SELECT u.firstname, u.lastname, f.*
                                                         FROM " . FRAMEWORK['FILE']['GLOBAL']['TABLE_NAME'] . " f
                                                         LEFT JOIN " . FRAMEWORK['AUTH']['MODULES']['DEFAULT']['DB'] . '.' . FRAMEWORK['AUTH']['MODULES']['DEFAULT']['TABLE_NAME'] . " u ON u.UID = f.create_UID
                                                         WHERE f.FK_NAME = ? AND f.FK_TABLE = ? AND f.doctype = ?" .
            ($this->data->fk_id != null ? " AND f.FK_ID = " . $this->data->fk_id : ""),
            [$this->data->fk_name, $this->data->fk_table, $this->data->doctype]);

        foreach ($this->response->files['data'] as &$file) {
            if ($this->data->thumbnails === true && $this->isImage($file)) {
                $realpath = $this->getRealFilePath('thumb', $file['path'], $file['name'], $file['extension'], $file['encrypted']);
            } else {
                $realpath = $this->getRealFilePath('orig', $file['path'], $file['name'], $file['extension'], $file['encrypted']);
            }

            // get thumbnail for images, mimeImage for other types
            if ($this->isImage($file)) {
                $file_data = file_get_contents($realpath);

                // if the file was not found show missing icon (this should not happen)
                if ($file_data === false) {
                    $file['imgData'] = $this->getMimeImage('missing');
                    debug('File not found: ' . $realpath, DEBUGTYPE_WARNING);
                    continue;
                }

                if ($file['encrypted'] == '1') {
                    $file['imgData'] = 'data:' . $file['mimetype'] . ';base64,' . base64_encode($this->decrypt($file_data));
                } else {
                    $file['imgData'] = 'data:' . $file['mimetype'] . ';base64,' . base64_encode($file_data);
                }
            } else {
                $file['imgData'] = $this->getMimeImage($file['extension']);
            }
        }
    }

    public function update()
    {
        $columns = array_map(function ($element) {
            return $element->key . " = ?";
        }, $this->data->fields);

        $values = array_map(function ($element) {
            return $element->value;
        }, $this->data->fields);
        $values[] = $this->data->FID;

        $this->response->update = $this->db->query("UPDATE " . FRAMEWORK['FILE']['GLOBAL']['TABLE_NAME'] . " SET " . join(",", $columns) . " WHERE FID = ?", $values);
    }

    public function deleteFile()
    {
        if (isset($this->data->FID)) {
            $file = $this->db->query("SELECT path, fullname, name FROM " . FRAMEWORK['FILE']['GLOBAL']['TABLE_NAME'] . " WHERE FID = ?", [$this->data->FID])['data'][0];

            $realpath = FRAMEWORK['FILE']['GLOBAL']['PATH'] . str_replace('/', DIRECTORY_SEPARATOR, $file['path']);
            $fullname = $realpath . $file['fullname'];

            if (!file_exists($fullname)) {
                $this->db->query("DELETE FROM " . FRAMEWORK['FILE']['GLOBAL']['TABLE_NAME'] . " WHERE FID=?", [$this->data->FID]);
                $this->writeLog(
                    'delete-file',
                    'File ' . $fullname . '" wurde gelöscht',
                    'deleteFile()');
                debug('File ' . $fullname . '" wurde gelöscht', DEBUGTYPE_SUCCESS);
            } else {
                if (unlink($fullname) == true) {
                    $this->writeLog(
                        'delete-file',
                        'File ' . $fullname . '" wurde gelöscht',
                        'deleteFile()');
                    debug('File ' . $fullname . '" wurde gelöscht', DEBUGTYPE_SUCCESS);
                    foreach (glob($realpath . $file['name'] . '*') as $filename) {
                        if (unlink($filename) === true) {
                            $this->writeLog(
                                'delete-file',
                                'File ' . $filename . '" wurde gelöscht',
                                'deleteFile()');
                            debug('File ' . $filename . '" wurde gelöscht', DEBUGTYPE_SUCCESS);
                        } else {
                            $this->writeLog(
                                'error-file',
                                'File ' . $filename . '" konnte nicht gelöscht werden',
                                'deleteFile()');
                            debug('File ' . $filename . '" konnte nicht gelöscht werden', DEBUGTYPE_ERROR);
                        }
                    }
                    $result = $this->db->query("DELETE FROM " . FRAMEWORK['FILE']['GLOBAL']['TABLE_NAME'] . " WHERE FID=?", [$this->data->FID]);
                    if (isset($result['error']) && $result['error'] != null) {
                        $error[] = $result['error'];
                        $this->writeLog(
                            'error',
                            json_encode($error) . '::FID=' . $this->data->FID,
                            'deleteFile()');
                        debug(json_encode($error) . '::FID=' . $this->data->FID, DEBUGTYPE_ERROR);
                    } else {
                        $this->writeLog(
                            'delete',
                            'files::FID=' . $this->data->FID,
                            'deleteFile()');
                        $this->response->status = true;
                        debug('File "' . $this->data->FID . '" wurde gelöscht', DEBUGTYPE_SUCCESS);
                    }
                } else {
                    $this->writeLog(
                        'error-file',
                        'File "' . $fullname . '" konnte nicht gelöscht werden',
                        'deleteFile()');
                    $this->response->status = false;
                    debug('File "' . $fullname . '" konnte nicht gelöscht werden', DEBUGTYPE_ERROR);
                }
            }
        } else {
            $this->writeLog(
                'error-file',
                '"FID" nicht vorhanden, File konnte nicht gelöscht werden',
                'deleteFile()');
            $this->response->status = false;
            debug('FID nicht vorhanden, File konnte nicht gelöscht werden', DEBUGTYPE_ERROR);
        }
    }

    public function deleteFileUid()
    {
        if (isset($this->data->FID)) {
            $file = $this->db->query("SELECT path,fullname,name,doctype FROM " . FRAMEWORK['FILE']['GLOBAL']['TABLE_NAME'] . " WHERE FID=? AND create_UID=?", [$this->data->FID, $this->currentUID])['data'][0];
            $realpath = FRAMEWORK['FILE']['GLOBAL']['PATH'] . str_replace('/', DIRECTORY_SEPARATOR, $file['path']);
            $fullname = $realpath . $file['fullname'];
            debug($fullname, DEBUGTYPE_INFO);

            if (!file_exists($fullname)) {
                $this->db->query("DELETE FROM " . FRAMEWORK['FILE']['GLOBAL']['TABLE_NAME'] . " WHERE FID=?", [$this->data->FID]);
                $this->writeLog(
                    'delete-file',
                    'File ' . $fullname . '" wurde gelöscht',
                    'deleteFile()');
                debug('File ' . $fullname . '" wurde gelöscht', DEBUGTYPE_SUCCESS);
            } else {
                if (unlink($fullname)) {
                    $this->writeLog(
                        'delete-file',
                        'File ' . $fullname . '" wurde gelöscht',
                        'deleteFile()');
                    debug('File ' . $fullname . '" wurde gelöscht', DEBUGTYPE_SUCCESS);
                    foreach (glob($realpath . $file['name'] . '*') as $filename) {
                        if (unlink($filename) === true) {
                            $this->writeLog(
                                'delete-file',
                                'File ' . $filename . '" wurde gelöscht',
                                'deleteFile()');
                            debug('File ' . $fullname . '" wurde gelöscht', DEBUGTYPE_SUCCESS);
                        } else {
                            $this->writeLog(
                                'error-file',
                                'File ' . $filename . '" konnte nicht gelöscht werden',
                                'deleteFile()');
                            debug('File ' . $filename . '" konnte nicht gelöscht werden', DEBUGTYPE_ERROR);
                        }
                    }
                    $result = $this->db->query("DELETE FROM " . FRAMEWORK['FILE']['GLOBAL']['TABLE_NAME'] . " WHERE FID=?", [$this->data->FID]);
                    if (isset($result['error']) && $result['error'] != null) {
                        $error[] = $result['error'];
                        $this->writeLog(
                            'error',
                            json_encode($error) . '::FID=' . $this->data->FID,
                            'deleteFile()');
                        debug(json_encode($error) . '::FID=' . $this->data->FID, DEBUGTYPE_ERROR);
                    } else {
                        $this->writeLog(
                            'delete',
                            'files::FID=' . $this->data->FID,
                            'deleteFile()');
                        debug('files::FID=' . $this->data->FID, DEBUGTYPE_SUCCESS);
                        $this->response->status = true;
                    }
                } else {
                    $this->writeLog(
                        'error-file',
                        'File "' . $fullname . '" konnte nicht gelöscht werden',
                        'deleteFile()');
                    debug('File "' . $fullname . '" konnte nicht gelöscht werden', DEBUGTYPE_ERROR);
                    $this->response->status = false;
                }
            }
        } else {
            $this->writeLog(
                'error-file',
                '"FID" nicht vorhanden, File konnte nicht gelöscht werden',
                'deleteFile()');
            $this->response->status = false;
            debug('FID nicht vorhanden, File konnte nicht gelöscht werden', DEBUGTYPE_ERROR);
        }
    }

    public function deleteFiles()
    {
        $sql = "";
        $data = [];

        if (isset($this->data->FK_ID)) {
            $sql .= " AND FK_ID = :FK_ID";
            $data['FK_ID'] = $this->data->FK_ID;
        }
        if (isset($this->data->FK_name)) {
            $sql .= " AND FK_name = :FK_name";
            $data['FK_name'] = $this->data->FK_name;
        }
        if (isset($this->data->FK_table)) {
            $sql .= " AND FK_table = :FK_table";
            $data['FK_table'] = $this->data->FK_table;
        }
        if (isset($this->data->doctype)) {
            $sql .= " AND doctype = :doctype";
            $data['doctype'] = $this->data->doctype;
        }

        if (count($data) == 4) {
            $res = $this->db->query("SELECT FID from " . FRAMEWORK['FILE']['GLOBAL']['TABLE_NAME'] . " WHERE 1 " . $sql, $data);
            if (intval($res['count']) > 0) {
                foreach ($res['data'] as $element) {
                    $this->data->FID = $element['FID'];
                    $this->deleteFile();
                }
            }
        } else {
            $this->response->error = 'ERROR input parameters';
        }
    }

    public function upload()
    {

        // check for missing extensions - only required for local Windows environment
        $missing_extensions = [];
        if (!extension_loaded('gd')) $missing_extensions[] = 'GD';
        if (!extension_loaded('openssl')) $missing_extensions[] = 'OpenSSL';
        if (!extension_loaded('fileinfo')) $missing_extensions[] = 'Fileinfo';
        if (!extension_loaded('mbstring')) $missing_extensions[] = 'mbstring';
        if (!extension_loaded('exif')) $missing_extensions[] = 'exif';
        if (count($missing_extensions) > 0) {
            debug('PHP Module(s) not loaded: ' . join(', ', $missing_extensions), DEBUGTYPE_ERROR);
            return $this->response->error = ['error' => 'PHP Module(s) not loaded: ' . join(', ', $missing_extensions)];
        }

        // Check FRAMEWORK config TODO: add debug message
        if (!isset(FRAMEWORK['FILE']['GLOBAL']['PATH'])) return false;
        if (!isset(FRAMEWORK['FILE']['DOCTYPES'])) return false;
        foreach (FRAMEWORK['FILE']['DOCTYPES'] as $element) {
            if (!isset($element['PATH'])) return false;
            if (!isset($element['IMAGE_RESIZE'])) return false;
        }

        $doctype_path = FRAMEWORK['FILE']['DOCTYPES'][$this->data->doctype]['PATH'];
        $path = FRAMEWORK['FILE']['GLOBAL']['PATH'] . $doctype_path;

        if (!isset($this->data->upload_files)) {
            $this->response->error = "No files uploaded";
            return false;
        }

        $file_array = self::reArrayFiles($this->data->upload_files);

        foreach ($file_array as $file_key => $file) {

            $fileSize = $file['size'];
            $fileWidth = null;
            $fileHeight = null;

            $path_parts = pathinfo($file['name']);
            $fileTmpName = $file['tmp_name'];

            $mime = finfo_file(finfo_open(FILEINFO_MIME_TYPE), $file['tmp_name']);
            $subsets = [];

            $existing_count = $this->db->query("select count(*) as sum from files where doctype = :DOCTYPE", [
                'DOCTYPE' => $this->data->doctype
            ])['data'][0]['sum'];

            // set target folder based on existing count
            $folder = intval(intval($existing_count) / FRAMEWORK['FILE']['GLOBAL']['MAX_FOLDER_ITEMS']);

            // create folder if it does not exist already
            if (!is_dir($path . DIRECTORY_SEPARATOR . $folder)) {
                mkdir($path . DIRECTORY_SEPARATOR . $folder, 0755, true);
            }

            if (!is_writable($path . DIRECTORY_SEPARATOR . $folder)) {
                debug('Destination directory not writable.', DEBUGTYPE_ERROR);
                $this->response->error = [
                    'status' => false,
                    'msg' => 'Destination directory not writable.',
                    'path' => $path
                ];
                $this->writeLog(
                    'error-file',
                    'Destination directory not writable."' . $path . '"',
                    'upload()');
            } else {
                $generatedName = $this->data->doctype . '_' . $this->data->fk_id . '_' . rand(1000000, 9999999);

                // save original
                if (in_array('orig', FRAMEWORK['FILE']['DOCTYPES'][$this->data->doctype]['IMAGE_RESIZE'])) {
                    $subsets[] = $this->saveOriginal($this->data->doctype, $generatedName, $path, $path_parts['extension'], $folder, $fileTmpName, $mime);
                }

                switch ($mime) {
                    case 'image/png':
                    case 'image/gif':
                    case 'image/jpeg':
                        $gps = $this->get_image_location($fileTmpName);
                        $fileDimensions = getimagesize($fileTmpName);
                        $fileWidth = $fileDimensions[0];
                        $fileHeight = $fileDimensions[1];

                        foreach (FRAMEWORK['FILE']['DOCTYPES'][$this->data->doctype]['IMAGE_RESIZE'] as $task) {

                            if ($task == 'orig') continue;

                            $imageResourceId = $this->getImageResourceId($mime, $fileTmpName);
                            $targetLayer = $this->imageResize($mime, $imageResourceId, $fileWidth, $fileHeight, $task);
                            $this->addWatermark($targetLayer, $this->data->doctype, $task);
                            $filename = $this->saveImageResourceToFileSystem($this->data->doctype, $generatedName, $path, $path_parts['extension'], $folder, $targetLayer, $mime, $task);

                            $subsets[] = $filename;
                        }
                        break;
                    default:
                        $gps = [
                            'latitude' => null,
                            'longitude' => null
                        ];
                        break;
                }

                $this->db->insert(
                    [
                        'field_list' => [
                            'FK_ID' => $this->data->fk_id,
                            'FK_name' => $this->data->fk_name,
                            'FK_table' => $this->data->fk_table,
                            'doctype' => $this->data->doctype,
                            'lat' => $gps['latitude'],
                            'lng' => $gps['longitude'],
                            'path' => str_replace('\\', '/', $doctype_path . $folder . DIRECTORY_SEPARATOR),
                            'fullname' => (FRAMEWORK['FILE']['DOCTYPES'][$this->data->doctype]['ENCRYPT_FILES'] === true) ? $generatedName . '.' . $path_parts['extension'] . '.enc' : $generatedName . '.' . $path_parts['extension'],
                            'name' => $generatedName,
                            'extension' => $path_parts['extension'],
                            'mimetype' => $mime,
                            'size' => $fileSize,
                            'width' => $fileWidth,
                            'height' => $fileHeight,
                            'display_name' => $this->data->displayNames[$file_key],
                            'encrypted' => (FRAMEWORK['FILE']['DOCTYPES'][$this->data->doctype]['ENCRYPT_FILES'] === true) ? '1' : '0',
                            'create_UID' => $this->currentUID
                        ],
                        'table' => FRAMEWORK['FILE']['GLOBAL']['TABLE_NAME'],
                        'index_name' => 'FID',
                        'write_history' => false,
                        'logUid' => $this->currentUID,
                        'logComponent' => 'Upload.php',
                        'logMethod' => 'doUpload()'
                    ]
                );

                $this->response->results[] = [
                    'status' => true,
                    'path' => $doctype_path . $folder,
                    'generatedName' => $generatedName,
                    'generatedExtension' => $path_parts['extension'],
                    'origName' => $path_parts['basename'],
                    'origFilesize' => $fileSize,
                    'origWidth' => $fileWidth,
                    'origHeight' => $fileHeight,
                    'mime' => $mime,
                    'generatedFiles' => $subsets,
                    'fid' => $this->db->lastInsertId(),
                    'fk_id' => $this->data->fk_id,
                    'fk_name' => $this->data->fk_name,
                    'fk_table' => $this->data->fk_table,
                    'doctype' => $this->data->doctype,
                    'db_path' => $doctype_path,
                    'encrypted' => (FRAMEWORK['FILE']['DOCTYPES'][$this->data->doctype]['ENCRYPT_FILES'] === true) ? '1' : '0',
                    'UID' => $this->currentUID
                ];

                $this->writeLog(
                    'insert-file',
                    'Insert File [Folder="' . $doctype_path . $folder . '", Files="' . json_encode($subsets) . '"]',
                    'upload()');

            }
        }

        return true;
    }

    /**
     * Adds a watermark to an image.
     * The watermark file needs to be a PNG.
     *
     * @source https://www.php.net/manual/de/image.examples.merged-watermark.php
     * @param $image
     * @param string $doctype
     * @param string $task
     */
    private function addWatermark(&$image, string $doctype, string $task): void
    {
        // don't add watermark to thumbnail
        if ($task == 'thumb') return;

        if (!isset(FRAMEWORK['FILE']['DOCTYPES'][$doctype]['WATERMARK'])) return;

        $watermark = imagecreatefrompng(FRAMEWORK['FILE']['DOCTYPES'][$doctype]['WATERMARK']['IMAGE']);

        $margin_right = 10;
        $margin_bottom = 10;

        // TODO: set position based on config, currently always bottom right

        imagecopymerge(
            $image,
            $watermark,
            imagesx($image) - imagesx($watermark) - $margin_right,
            imagesy($image) - imagesy($watermark) - $margin_bottom,
            0, 0,
            imagesx($watermark),
            imagesy($watermark),
            FRAMEWORK['FILE']['DOCTYPES'][$doctype]['WATERMARK']['OPACITY']);
    }

    /**
     * Gets image resource id based on mimetype.
     *
     * @param string $mime
     * @param string $filename
     * @return false|GdImage|resource|null
     */
    private function getImageResourceId(string $mime, string $filename)
    {
        switch ($mime) {
            case 'image/png':
                return imagecreatefrompng($filename);
            case 'image/gif':
                return imagecreatefromgif($filename);
            case 'image/jpeg':
                return imagecreatefromjpeg($filename);
            default:
                return null;
        }
    }

    /**
     * Saves a GD image to the filesystem, using the appropriate method.
     *
     * @param string $doctype
     * @param string $generatedName
     * @param string $path
     * @param string $extension
     * @param string $folder
     * @param $imageResourceId
     * @param string $mime
     * @param string $task
     * @return string The filename
     */
    private function saveImageResourceToFileSystem(string $doctype, string $generatedName, string $path, string $extension, string $folder, $imageResourceId, string $mime, string $task): string
    {
        if (FRAMEWORK['FILE']['DOCTYPES'][$doctype]['ENCRYPT_FILES'] === true) {
            $filename = $generatedName . ($task != 'orig' ? "_" . $task : '') . '.' . $extension . '.enc';
            ob_start();
            switch ($mime) {
                case 'image/png':
                    imagepng($imageResourceId);
                    break;
                case 'image/gif':
                    imagegif($imageResourceId);
                    break;
                case 'image/jpeg':
                    imagejpeg($imageResourceId);
                    break;
            }
            file_put_contents(
                $path . DIRECTORY_SEPARATOR . $folder . DIRECTORY_SEPARATOR . $filename,
                $this->encrypt(ob_get_contents())
            );
            ob_end_clean();
            return $filename;
        } else {
            $filename = $generatedName . ($task != 'orig' ? "_" . $task : '') . '.' . $extension;
            switch ($mime) {
                case 'image/png':
                    imagepng($imageResourceId, $path . DIRECTORY_SEPARATOR . $folder . DIRECTORY_SEPARATOR . $filename);
                    break;
                case 'image/gif':
                    imagegif($imageResourceId, $path . DIRECTORY_SEPARATOR . $folder . DIRECTORY_SEPARATOR . $filename);
                    break;
                case 'image/jpeg':
                    imagejpeg($imageResourceId, $path . DIRECTORY_SEPARATOR . $folder . DIRECTORY_SEPARATOR . $filename);
                    break;
            }
            return $filename;
        }
    }

    /**
     * Saves the original file.
     *
     * @param string $doctype
     * @param string $generatedName
     * @param string $path
     * @param string $extension
     * @param string $folder
     * @param string $fileTmpName
     * @param string $mime
     * @return string The full name of the file
     */
    private function saveOriginal(string $doctype, string $generatedName, string $path, string $extension, string $folder, string $fileTmpName, string $mime): string
    {

        // if the file is an image and we want to add a watermark load it with GD
        if (substr($mime, 0, 5) == 'image' && isset(FRAMEWORK['FILE']['DOCTYPES'][$doctype]['WATERMARK'])) {
            $imageResourceId = $this->getImageResourceId($mime, $fileTmpName);

            $this->addWatermark($imageResourceId, $doctype, 'orig');

            $filename = $this->saveImageResourceToFileSystem($doctype, $generatedName, $path, $extension, $folder, $imageResourceId, $mime, 'orig');
        } else {
            // if the file is no image save it directly
            if (FRAMEWORK['FILE']['DOCTYPES'][$doctype]['ENCRYPT_FILES'] === true) {
                $filename = $generatedName . "." . $extension . '.enc';
                file_put_contents(
                    $path . DIRECTORY_SEPARATOR . $folder . DIRECTORY_SEPARATOR . $filename,
                    $this->encrypt(file_get_contents($fileTmpName))
                );
            } else {
                $filename = $generatedName . "." . $extension;
                copy($fileTmpName, $path . DIRECTORY_SEPARATOR . $folder . DIRECTORY_SEPARATOR . $filename);
            }
        }
        return $filename;
    }

    private function imageResize(string $mime, $imageResourceId, int $width, int $height, string $task)
    {
        $targetWidth = 20;
        $targetHeight = 20;
        $src_x = 0;
        $src_y = 0;

        switch ($task) {
            case 'thumb':
                $targetWidth = FRAMEWORK['FILE']['RESIZE']['THUMB']['X'];
                $targetHeight = FRAMEWORK['FILE']['RESIZE']['THUMB']['Y'];
                if (($width / $height) == ($targetWidth / $targetHeight)) {
                    $src_x = 0;
                    $src_y = 0;
                }
                if (($width / $height) > ($targetWidth / $targetHeight)) {
                    $src_y = 0;
                    $temp_width = $height * $targetWidth / $targetHeight;
                    $src_x = ($width - $temp_width) / 2;
                    $width = $temp_width;
                }
                if (($width / $height) < ($targetWidth / $targetHeight)) {
                    $src_x = 0;
                    $temp_height = $width * $targetHeight / $targetWidth;
                    $src_y = ($height - $temp_height) / 2;
                    $height = $temp_height;
                }
                break;
            case 's':
                if ($width > $height) {
                    $targetWidth = FRAMEWORK['FILE']['RESIZE']['S'];
                    $targetHeight = round($targetWidth * $height / $width, 0);
                } else {
                    $targetHeight = FRAMEWORK['FILE']['RESIZE']['S'];
                    $targetWidth = round($targetHeight * $width / $height, 0);
                }
                break;
            case 'm':
                if ($width > $height) {
                    $targetWidth = FRAMEWORK['FILE']['RESIZE']['M'];
                    $targetHeight = round($targetWidth * $height / $width, 0);
                } else {
                    $targetHeight = FRAMEWORK['FILE']['RESIZE']['M'];
                    $targetWidth = round($targetHeight * $width / $height, 0);
                }
                break;
            case 'l':
                if ($width > $height) {
                    $targetWidth = FRAMEWORK['FILE']['RESIZE']['L'];
                    $targetHeight = round($targetWidth * $height / $width, 0);
                } else {
                    $targetHeight = FRAMEWORK['FILE']['RESIZE']['L'];
                    $targetWidth = round($targetHeight * $width / $height, 0);
                }
                break;
            case 'xl':
                if ($width > $height) {
                    $targetWidth = FRAMEWORK['FILE']['RESIZE']['XL'];
                    $targetHeight = round($targetWidth * $height / $width, 0);
                } else {
                    $targetHeight = FRAMEWORK['FILE']['RESIZE']['XL'];
                    $targetWidth = round($targetHeight * $width / $height, 0);
                }
                break;
            case 'orig':
                $targetWidth = $width;
                $targetHeight = $height;
                break;
        }

        if ($task == 'orig') {
            return $imageResourceId;
        } else {
            $targetLayer = imagecreatetruecolor($targetWidth, $targetHeight);

            // preserve transparency
            if ($mime == "image/png" or $mime == "image/gif") {
                imagecolortransparent($targetLayer, imagecolorallocatealpha($targetLayer, 0, 0, 0, 127));
                imagealphablending($targetLayer, false);
                imagesavealpha($targetLayer, true);
            }

            imagecopyresampled($targetLayer, $imageResourceId, 0, 0, $src_x, $src_y, $targetWidth, $targetHeight, $width, $height);
            return $targetLayer;
        }
    }

    private function reArrayFiles(&$file_post): array
    {
        $file_array = [];
        $file_count = count($file_post['name']);
        $file_keys = array_keys($file_post);
        for ($i = 0; $i < $file_count; $i++) {
            foreach ($file_keys as $key) {
                $file_array[$i][$key] = $file_post[$key][$i];
            }
        }
        return $file_array;
    }

    public function encrypt(string $data): string
    {
        ini_set("memory_limit", "512M");

        // Remove the base64 encoding from our key
        $encryption_key = base64_decode(FRAMEWORK['FILE']['GLOBAL']['ENCRYPT_KEY']);
        // Generate an initialization vector
        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-cbc'));
        // Encrypt the data using AES 256 encryption in CBC mode using our encryption key and initialization vector.
        $encrypted = openssl_encrypt($data, 'aes-256-cbc', $encryption_key, 0, $iv);
        // The $iv is just as important as the key for decrypting, so save it with our encrypted data using a unique separator (::)
        //return base64_encode($encrypted . '::' . $iv);
        return $encrypted . '::' . $iv;
    }

    public function decrypt(string $imagedata): string
    {
        ini_set("memory_limit", "1024M");
        // Remove the base64 encoding from our key
        $encryption_key = base64_decode(FRAMEWORK['FILE']['GLOBAL']['ENCRYPT_KEY']);
        // To decrypt, split the encrypted data from our IV - our unique separator used was "::"
        //list($encrypted_data, $iv) = explode('::', base64_decode($data), 2);
        list($decrypted_data, $iv) = explode('::', $imagedata, 2);
        return openssl_decrypt($decrypted_data, 'aes-256-cbc', $encryption_key, 0, $iv);
    }

    private function writeLog(string $type, string $text, string $action): void
    {
        Log::write(
            $this->currentUID,
            $type,
            $text,
            'FileUpload',
            'onUpload()',
            'FileController.php',
            $action
        );
    }

    private function get_image_location(string $image = '')
    {
        $exif = exif_read_data($image, 0, true);
        if (isset($exif['GPS']['GPSLatitudeRef']) && isset($exif['GPS']['GPSLatitude']) && isset($exif['GPS']['GPSLongitudeRef']) && isset($exif['GPS']['GPSLongitude'])) {
            $GPSLatitudeRef = $exif['GPS']['GPSLatitudeRef'];
            $GPSLatitude = $exif['GPS']['GPSLatitude'];
            $GPSLongitudeRef = $exif['GPS']['GPSLongitudeRef'];
            $GPSLongitude = $exif['GPS']['GPSLongitude'];

            $lat_degrees = count($GPSLatitude) > 0 ? $this->gps2Num($GPSLatitude[0]) : 0;
            $lat_minutes = count($GPSLatitude) > 1 ? $this->gps2Num($GPSLatitude[1]) : 0;
            $lat_seconds = count($GPSLatitude) > 2 ? $this->gps2Num($GPSLatitude[2]) : 0;

            $lon_degrees = count($GPSLongitude) > 0 ? $this->gps2Num($GPSLongitude[0]) : 0;
            $lon_minutes = count($GPSLongitude) > 1 ? $this->gps2Num($GPSLongitude[1]) : 0;
            $lon_seconds = count($GPSLongitude) > 2 ? $this->gps2Num($GPSLongitude[2]) : 0;

            $lat_direction = ($GPSLatitudeRef == 'W' or $GPSLatitudeRef == 'S') ? -1 : 1;
            $lon_direction = ($GPSLongitudeRef == 'W' or $GPSLongitudeRef == 'S') ? -1 : 1;

            $latitude = $lat_direction * ($lat_degrees + ($lat_minutes / 60) + ($lat_seconds / (60 * 60)));
            $longitude = $lon_direction * ($lon_degrees + ($lon_minutes / 60) + ($lon_seconds / (60 * 60)));

            return ['latitude' => $latitude, 'longitude' => $longitude];
        } else {
            return ['latitude' => null, 'longitude' => null];
        }
    }

    private
    function gps2Num(string $coordPart): float
    {
        $parts = explode('/', $coordPart);
        if (count($parts) <= 0)
            return 0;
        if (count($parts) == 1)
            return $parts[0];
        return floatval($parts[0]) / floatval($parts[1]);
    }
}

