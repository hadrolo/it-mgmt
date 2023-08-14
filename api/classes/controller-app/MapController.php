<?php

class Map extends Controller
{

    private function haversineGreatCircleDistance($latitudeFrom, $longitudeFrom, $latitudeTo, $longitudeTo, $earthRadius = 6371000)
    {
        /**
         * Calculates the great-circle distance between two points, with
         * the Haversine formula.
         * @param float $latitudeFrom Latitude of start point in [deg decimal]
         * @param float $longitudeFrom Longitude of start point in [deg decimal]
         * @param float $latitudeTo Latitude of target point in [deg decimal]
         * @param float $longitudeTo Longitude of target point in [deg decimal]
         * @param float $earthRadius Mean earth radius in [m]
         * @return float Distance between points in [m] (same as earthRadius)
         */

        // convert from degrees to radians
        $latFrom = deg2rad($latitudeFrom);
        $lonFrom = deg2rad($longitudeFrom);
        $latTo = deg2rad($latitudeTo);
        $lonTo = deg2rad($longitudeTo);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
                cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));
        return $angle * $earthRadius;
    }

    private function getGpsDataByRandomName($random_name)
    {
        return $this->db->query("SELECT * FROM section_gps WHERE random_name = ? GROUP BY random_name", [$random_name])['data'][0];
    }

    private function vincentyGreatCircleDistance($latitudeFrom, $longitudeFrom, $latitudeTo, $longitudeTo, $earthRadius = 6371000)
    {
        /**
         * Calculates the great-circle distance between two points, with
         * the Vincenty formula.
         * @param float $latitudeFrom Latitude of start point in [deg decimal]
         * @param float $longitudeFrom Longitude of start point in [deg decimal]
         * @param float $latitudeTo Latitude of target point in [deg decimal]
         * @param float $longitudeTo Longitude of target point in [deg decimal]
         * @param float $earthRadius Mean earth radius in [m]
         * @return float Distance between points in [m] (same as earthRadius)
         */

        // convert from degrees to radians
        $latFrom = deg2rad($latitudeFrom);
        $lonFrom = deg2rad($longitudeFrom);
        $latTo = deg2rad($latitudeTo);
        $lonTo = deg2rad($longitudeTo);

        $lonDelta = $lonTo - $lonFrom;
        $a = pow(cos($latTo) * sin($lonDelta), 2) +
            pow(cos($latFrom) * sin($latTo) - sin($latFrom) * cos($latTo) * cos($lonDelta), 2);
        $b = sin($latFrom) * sin($latTo) + cos($latFrom) * cos($latTo) * cos($lonDelta);

        $angle = atan2(sqrt($a), $b);
        return $angle * $earthRadius;
    }

    public function getRiverCoordinates()
    {
        $out = null;
        $out2 = null;
        $sections = $this->db->query("SELECT RID, SID from section WHERE RID=? ORDER BY sort_index", [$this->data->RID])['data'];
        foreach ($sections as $section) {
            $data = $this->db->query("SELECT SKOID, type, lat, lng FROM section_gps WHERE SID=?", [$section['SID']]);
            $data['section'] = $section;
            $data['putin']['lat'] = $data['data'][0]['lat'];
            $data['putin']['lng'] = $data['data'][0]['lng'];
            $out[] = $data;
        }
        $mapcenter = $this->db->query("SELECT avg(lat) as lat, avg(lng) as lng FROM section_gps WHERE RID=?", [$this->data->RID])['data'][0];
        $out2['lat'] = $mapcenter['lat'];
        $out2['lng'] = $mapcenter['lng'];
        $this->response->coordinates = $out;
        $this->response->mapcenter = $out2;
    }

    public function getVersionList()
    {
        $this->response->mapVersions = $this->db->query("SELECT
            gv.GVID,
            gv.CID,
            gv.RID,
            gv.SID,
            gv.PID,
            gv.status,
            gv.create_UID,
            IF (:LANG = 'de', DATE_FORMAT(gv.create_date, '%d.%m.%Y %H:%i'), DATE_FORMAT(gv.create_date, '%Y.%m.%d %H:%i')) AS create_date,
            u.username AS create_username
            FROM gps_version AS gv  LEFT JOIN users AS u ON u.UID=gv.create_UID WHERE gv." . $this->data->key . " = :VALUE",
            ['VALUE' => $this->data->value, 'LANG' => $this->data->LANG]);
    }

    public function getSectionVersion()
    {
        $out_polylines = null;
        $out_markers = null;

        $lat_start = null;
        $lng_start = null;

        $this->response->selectdVersion = $this->db->query("SELECT
            gv.GVID,
            gv.CID,
            gv.RID,
            gv.SID,
            gv.PID,
            gv.status,
            gv.create_UID,
            IF (:LANG = 'de', DATE_FORMAT(gv.create_date, '%d.%m.%Y %H:%i'), DATE_FORMAT(gv.create_date, '%Y.%m.%d %H:%i')) AS create_date,
            u.username AS create_username
            FROM gps_version AS gv  LEFT JOIN users AS u ON u.UID=gv.create_UID
            WHERE gv.GVID = :GVID", ['GVID' => $this->data->GVID, 'LANG' => $this->data->LANG])['data'][0];

        $polylines = $this->db->query("SELECT
            gd.SID,
            gd.random_name,
            gd.type,
            gd.GTID,
            gd.distance,
            gd.create_UID,
            gd.create_date,
            u.username AS create_username,
            gt.color,
            gt.filename,
            gt.translate
            FROM gps_data AS gd
            LEFT JOIN gps_type AS gt ON gt.GTID = gd.GTID
            LEFT JOIN users AS u ON gd.create_UID = u.UID
            WHERE gd.GVID = ? AND gd.SID = ? AND gd.type = 'polyline'
            GROUP BY random_name", [$this->data->GVID, $this->data->SID])['data'];

        foreach ($polylines as $index => $polyline) {
            $data = $this->db->query("SELECT
                gd.*,
                u.username AS create_username
                FROM gps_data AS gd
                LEFT JOIN users AS u ON gd.create_UID = u.UID
                WHERE random_name=? AND SID=?", [$polyline['random_name'], $this->data->SID]);
            $data['polyline_no'] = $index + 1;
            $data['SID'] = $polyline['SID'];
            $data['random_name'] = $polyline['random_name'];
            $data['GTID'] = $polyline['GTID'];
            $data['putin']['lat'] = $data['data'][0]['lat'];
            $data['putin']['lng'] = $data['data'][0]['lng'];
            $data['distance'] = $data['data'][0]['distance'];
            $data['create_UID'] = $data['data'][0]['create_UID'];
            $data['create_date'] = $data['data'][0]['create_date'];
            $data['create_username'] = $data['data'][0]['create_username'];
            $data['color'] = $polyline['color'];
            $data['filename'] = $polyline['filename'];
            $data['translate'] = $polyline['translate'];
            if (isset($this->data->random_name) && $this->data->random_name == $data['random_name']) {  //todo: PRÜFEN ob nötig
                $data['selected'] = 1;
                $this->response->selectedPolyline = $data;
            } else {
                $data['selected'] = 0;
                $this->response->selectedPolyline = null;
            }
            $out_polylines[] = $data;
            if ($lat_start == null && $lng_start == null) {
                $lat_start = $data['putin']['lat'];
                $lng_start = $data['putin']['lng'];
            }
        }
        $this->response->polylineList = $out_polylines;


        $markerList = $this->db->query("SELECT
            gd.SID,
            gd.random_name,
            gd.type,
            gd.GTID,
            gd.lat,
            gd.lng,
            gd.create_UID,
            gd.create_date,
            gt.filename,
            gt.z_index,
            u.username AS create_username
            FROM gps_data AS gd
            LEFT JOIN gps_type AS gt ON gt.GTID = gd.GTID
            LEFT JOIN users AS u ON gd.create_UID = u.UID
            WHERE gd.GVID = ? AND gd.SID = ? AND gd.type = 'marker'
            GROUP BY random_name", [$this->data->GVID, $this->data->SID])['data'];


        foreach ($markerList as $index => $marker) {
            $markerList[$index]['marker_no'] = $index + 1;
        }

        $this->response->markerList = $markerList;


        $gps = $this->db->query("SELECT
            MIN(lat) AS lat_min,
            MAX(lat) AS lat_max,
            MIN(lng) AS lng_min,
            MAX(lng) AS lng_max,
            AVG(lat) AS avg_lat,
            AVG(lng) AS avg_lng
            FROM gps_data AS gd
            WHERE gd.GVID = ? AND gd.SID = ?", [$this->data->GVID, $this->data->SID])['data'][0];
        $gps['lat_distance'] = round($this->haversineGreatCircleDistance($gps['lat_min'], $gps['lng_min'], $gps['lat_max'], $gps['lng_min']));
        $gps['lng_distance'] = round($this->haversineGreatCircleDistance($gps['lat_min'], $gps['lng_min'], $gps['lat_min'], $gps['lng_max']));
        $gps['distance'] = round($gps['lat_distance'] > $gps['lng_distance'] ? $gps['lat_distance'] : $gps['lng_distance']);
        $this->response->mapGps = $gps;
    }

    public function insertVersion()
    {
        // INSERT VERSION
        $data['CID'] = $this->data->riverMgmtData->CID ?? null;
        $data['RID'] = $this->data->riverMgmtData->RID ?? null;
        $data['SID'] = $this->data->riverMgmtData->SID ?? null;
        $data['PID'] = $this->data->riverMgmtData->PID ?? null;
        $data['STATUS'] = 'new';
        $data['CREATE_UID'] = $this->currentUID;
        $GVID = $this->db->query("INSERT INTO gps_version (CID, RID, SID, PID, status, create_UID) VALUES (:CID, :RID, :SID, :PID, :STATUS, :CREATE_UID)", $data)['lastID'];


        // INSERT POLYLINES
        foreach ($this->data->polylines as $polyline) {
            $lat_p1 = null;
            $lng_p1 = null;
            $distance = 0;

            $random_name = substr(hash('sha256', mt_rand()), 20);
            $data = [];

            foreach ($polyline->path as $key => $point) {
                $countPolylines = count($polyline->path);
                $polyline_tag = null;
                if ($key == 0) $polyline_tag = 'start';
                if ($countPolylines == 3 && $key == 1 || $countPolylines > 3 && $key + 1 == ceil($countPolylines / 2)) $polyline_tag = 'middle';
                if ($key + 1 === $countPolylines) $polyline_tag = 'end';

                if ($lat_p1 == null && $lng_p1 == null) {
                    $lat_p1 = trim($point->lat);
                    $lng_p1 = trim($point->lng);
                } else {
                    if ($lat_p1 != trim($point->lat) && $lng_p1 != trim($point->lng)) {
                        $distance = $distance + $this->haversineGreatCircleDistance($lat_p1, $lng_p1, trim($point->lat), trim($point->lng));
                        $lat_p1 = trim($point->lat);
                        $lng_p1 = trim($point->lng);
                    }
                }

                $data['GVID'] = isset($GVID) ? $GVID : null;
                $data['CID'] = $this->data->riverMgmtData->CID ?? null;
                $data['RID'] = $this->data->riverMgmtData->RID ?? null;
                $data['SID'] = $this->data->riverMgmtData->SID ?? null;
                $data['PID'] = $this->data->riverMgmtData->PID ?? null;
                $data['TYPE'] = 'polyline';
                $data['GTID'] = isset($polyline->GTID) ? $polyline->GTID : null;
                $data['RANDOM_NAME'] = $random_name;
                $data['DISTANCE'] = isset($distance) ? round($distance) : null;
                $data['LAT'] = isset($point->lat) ? trim($point->lat) : null;
                $data['LNG'] = isset($point->lng) ? trim($point->lng) : null;
                $data['CREATE_UID'] = $this->currentUID;
                $data['POLYLINE_TAG'] = $polyline_tag;
                $this->response->result = $this->db->query("INSERT INTO gps_data (GVID, CID, RID, SID, PID, type, polyline_tag, GTID, random_name, distance, lat, lng, create_UID)
                        VALUES (:GVID, :CID, :RID, :SID, :PID, :TYPE, :POLYLINE_TAG, :GTID, :RANDOM_NAME, :DISTANCE, :LAT, :LNG, :CREATE_UID)", $data);

            }
        }


        // INSERT MARKERS
        $data = [];
        foreach ($this->data->markers as $marker) {
            $data['GVID'] = isset($GVID) ? $GVID : null;
            $data['CID'] = $this->data->riverMgmtData->CID ?? null;
            $data['RID'] = $this->data->riverMgmtData->RID ?? null;
            $data['SID'] = $this->data->riverMgmtData->SID ?? null;
            $data['PID'] = $this->data->riverMgmtData->PID ?? null;
            $data['TYPE'] = 'marker';
            $data['GTID'] = isset($marker->GTID) ? $marker->GTID : null;
            $data['RANDOM_NAME'] = substr(hash('sha256', mt_rand()), 20);
            $data['LAT'] = isset($marker->lat) ? trim($marker->lat) : null;
            $data['LNG'] = isset($marker->lng) ? trim($marker->lng) : null;
            $data['CREATE_UID'] = $this->currentUID;
            $this->response->result = $this->db->query("INSERT INTO gps_data (GVID, CID, RID, SID, PID, type, GTID, random_name, lat, lng, create_UID)
                        VALUES (:GVID, :CID, :RID, :SID, :PID, :TYPE, :GTID, :RANDOM_NAME, :LAT, :LNG, :CREATE_UID)", $data);
        }

        $this->response->GVID = $GVID;
    }

    public function updateVersion()
    {
        $this->deleteVersion();
        $this->insertVersion();
    }

    public function deleteVersion()
    {
        $settings = [
            'table' => 'gps_data',
            'index_name' => 'GVID',
            'index_value' => $this->data->GVID,
            'check_field' => 'create_UID',
            'check_id' => $this->currentUID,
            'write_history' => true,
            'output_delete' => false,
            'logUid' => $this->currentUID,
            'logComponent' => $this->componentName,
            'logMethod' => $this->methodName
        ];
        $this->response->gps_data = $this->db->delete($settings);

        $settings = [
            'table' => 'gps_version',
            'index_name' => 'GVID',
            'index_value' => $this->data->GVID,
            'check_field' => 'create_UID',
            'check_id' => $this->currentUID,
            'write_history' => true,
            'output_delete' => false,
            'logUid' => $this->currentUID,
            'logComponent' => $this->componentName,
            'logMethod' => $this->methodName
        ];
        $this->response->deleted_version = $this->db->delete($settings);
    }

    private function compareGpsData()
    {

        // todo: check it 16 04 2021
        if (!isset($this->data->GVID)) $this->data->GVID = null;

        $dbData = $this->db->query("SELECT
            COUNT(*) as count,
            (SELECT sum(lat) FROM gps_data AS gp WHERE gp.SID=gd.SID AND type='polyline') AS latPolylineCount,
            (SELECT sum(lng) FROM gps_data AS gp WHERE gp.SID=gd.SID AND type='polyline') AS lngPolylineCount,
            (SELECT sum(lat) FROM gps_data AS gm WHERE gm.SID=gd.SID AND type='marker') AS latMarkerCount,
            (SELECT sum(lng) FROM gps_data AS gm WHERE gm.SID=gd.SID AND type='marker') AS lngMarkerCount
            FROM gps_data AS gd
            WHERE gd.GVID = ?", [$this->data->GVID])['data'][0];

        $latPolylineCount = 0;
        $lngPolylineCount = 0;
        foreach ($this->data->polylines as $polyline) {
            foreach ($polyline as $field => $value) {
                if ($field === 'path') {
                    foreach ($value as $key) {
                        foreach ($key as $k => $v) {
                            if ($k === 'lat') {
                                $latPolylineCount = $latPolylineCount + $v;
                            }
                            if ($k === 'lng') {
                                $lngPolylineCount = $lngPolylineCount + $v;
                            }
                        }
                    }
                }
            }
        }

        $latMarkerCount = 0;
        $lngMarkerCount = 0;
        foreach ($this->data->markers as $marker) {
            foreach ($marker as $k => $v) {
                if ($k === 'lat') {
                    $latMarkerCount = $latMarkerCount + $v;
                }
                if ($k === 'lng') {
                    $lngMarkerCount = $lngMarkerCount + $v;
                }
            }
        }

        $dbPolylines = $this->db->query("SELECT
            gv.GVID,
            gv.CID,
            gv.RID,
            gv.SID,
            gv.PID,
            gv.status,
            gv.create_UID,
            gv.create_date,
            gd.GDID,
            gd.type,
            gd.GTID,
            gd.random_name,
            gd.distance,
            gd.lat,
            gd.lng
            FROM gps_version AS gv
            LEFT JOIN gps_data AS gd ON gd.GVID=gv.GVID
            WHERE gv.GVID = ? AND type='polyline'
            GROUP BY gd.random_name", [$this->data->GVID])['data'];

        $polylineChangesCount = count($this->data->polylines);
        $polylineChangesDbCount = 0;
        foreach ($this->data->polylines as $polyline) {
            $found = false;
            foreach ($dbPolylines as $dbPolyline) {
                if ($found == false) {
                    if ($dbPolyline['random_name'] == $polyline->random_name) {
                        $found = true;
                        if ($dbPolyline['GTID'] == $polyline->data[0]->GTID) {
                            if ($dbPolyline['lat'] == $polyline->data[0]->lat) {
                                $polylineChangesDbCount = $polylineChangesDbCount + 1;
                            }
                        }
                    }
                }
            }
        }

        $dbMarkers = $this->db->query("SELECT
            gv.GVID,
            gv.CID,
            gv.RID,
            gv.SID,
            gv.PID,
            gv.status,
            gv.create_UID,
            gv.create_date,
            gd.GDID,
            gd.type,
            gd.GTID,
            gd.random_name,
            gd.distance,
            gd.lat,
            gd.lng
            FROM gps_version AS gv
            LEFT JOIN gps_data AS gd ON gd.GVID=gv.GVID
            WHERE gv.GVID = ? AND type='marker'", [$this->data->GVID])['data'];

        $markerChangesCount = count($this->data->markers);
        $markerChangesDbCount = 0;
        foreach ($this->data->markers as $marker) {
            $found = false;
            foreach ($dbMarkers as $dbMarker) {
                if ($found == false) {
                    if ($dbMarker['random_name'] == $marker->random_name) {
                        $found = true;
                        if ($dbMarker['GTID'] == $marker->GTID) {
                            if ($dbMarker['lat'] == $marker->lat) {
                                $markerChangesDbCount = $markerChangesDbCount + 1;
                            }
                        }
                    }
                }
            }
        }

        if ($dbData['latPolylineCount'] == $latPolylineCount
            && $dbData['lngPolylineCount'] == $lngPolylineCount
            && $dbData['latMarkerCount'] == $latMarkerCount
            && $dbData['lngMarkerCount'] == $lngMarkerCount
            && $polylineChangesCount == $polylineChangesDbCount
            && $markerChangesCount == $markerChangesDbCount
        ) {
            debug('COMPARED GPS-DATA EQUAL', DEBUGTYPE_SUCCESS);
            return true;
        } else {
            debug('COMPARED GPS-DATA NOT EQUAL', DEBUGTYPE_WARNING);
            return false;
        }
    }

    public function setLive()
    {
        $this->db->query("UPDATE gps_version SET status='OLD' WHERE SID = ? AND status='LIVE'", [$this->data->SID]);

        $settings = [
            'field_list' => [
                'status' => 'LIVE',
            ],
            'table' => 'gps_version',
            'index_name' => 'GVID',
            'index_value' => $this->data->GVID,
            'write_history' => true,
            'logUid' => $this->currentUID,
            'logComponent' => $this->componentName,
            'logMethod' => $this->methodName
        ];
        $this->response = $this->db->update($settings);
        $this->response['debug_controller'] = $this->data;
    }

    public function getData()
    {
        //debug($this->data, DEBUGTYPE_SPECIAL);
        $sql = '';
        $data = [
            'DE' => 'de',
            'EN' => 'en',
            'STATUS' => 'live',
            'LANG' => $this->data->LANG,
            'POLYLINE' => 'polyline'
        ];
        if (isset($this->data->RID) && strlen($this->data->RID) > 0) {
            $sql .= " AND gd.RID = :RID";
            $data['RID'] = $this->data->RID;
        }
        if (isset($this->data->SID) && strlen($this->data->SID) > 0) {
            $sql .= " AND gd.SID = :SID";
            $data['SID'] = $this->data->SID;
        }
        if (isset($this->data->PID) && strlen($this->data->PID) > 0) {
            $sql .= " AND gd.PID = :PID";
            $data['PID'] = $this->data->PID;
        }
        if (isset($this->data->CID) && strlen($this->data->CID) > 0) {
            $sql .= " AND gd.CID = :CID";
            $data['CID'] = $this->data->CID;
        }

        $polylineList = [];
        $markerList = [];
        $polylineMarkerList = [];

        // GENERATE POLYLINES
        if ($this->data->reduce_polyLines) {
            // REDUCE DATA
            debug('REDUCE_POLYLINES enabled', DEBUGTYPE_INFO);

            $result = $this->db->query("SELECT
                gd.CID,
                gd.RID,
                gd.SID,
                gd.PID,
                gd.type,
                gd.polyline_tag,
                gd.GTID,
                gd.lat,
                gd.lng,
                gt.filename,
                gt.color,
                gd.random_name,
                gd.distance,
                IF (:LANG = 'de', IF(rd_de.RDID IS NOT NULL, rd_de.name,IF(rd_en.RDID IS NOT NULL, rd_en.name,'No Value')), IF (:LANG = 'en', IF(rd_en.RDID IS NOT NULL, rd_en.name,IF(rd_de.RDID IS NOT NULL, rd_de.name,'No Value')), 'No Translation')) AS riverName,
                IF (:LANG = 'de', IF(rd_de.RDID IS NOT NULL, rd_de.link_name,IF(rd_en.RDID IS NOT NULL, rd_en.link_name,'No Value')), IF (:LANG = 'en', IF(rd_en.RDID IS NOT NULL, rd_en.link_name,IF(rd_de.RDID IS NOT NULL, rd_de.link_name,'No Value')), 'No Translation')) AS riverLink,
                IF (:LANG = 'de', IF(sd_de.SDID IS NOT NULL, sd_de.name,IF(sd_en.SDID IS NOT NULL, sd_en.name,'No Value')), IF (:LANG = 'en', IF(sd_en.SDID IS NOT NULL, sd_en.name,IF(sd_de.SDID IS NOT NULL, sd_de.name,'No Value')), 'No Translation')) AS sectionName,
                IF (:LANG = 'de', IF(sd_de.SDID IS NOT NULL, sd_de.difficulty,IF(sd_en.SDID IS NOT NULL, sd_en.difficulty,'No Value')), IF (:LANG = 'en', IF(sd_en.SDID IS NOT NULL, sd_en.difficulty,IF(sd_de.SDID IS NOT NULL, sd_de.difficulty,'No Value')), 'No Translation')) AS difficulty,
                IF (:LANG = 'de', IF(sd_de.SDID IS NOT NULL, sd_de.best_season,IF(sd_en.SDID IS NOT NULL, sd_en.best_season,'No Value')), IF (:LANG = 'en', IF(sd_en.SDID IS NOT NULL, sd_en.best_season,IF(sd_de.SDID IS NOT NULL, sd_de.best_season,'No Value')), 'No Translation')) AS best_season,
                IF (:LANG = 'de', IF(sd_de.SDID IS NOT NULL, sd_de.length,IF(sd_en.SDID IS NOT NULL, sd_en.length,'No Value')), IF (:LANG = 'en', IF(sd_en.SDID IS NOT NULL, sd_en.length,IF(sd_de.SDID IS NOT NULL, sd_de.length,'No Value')), 'No Translation')) AS length,
                IF (:LANG = 'de', IF(sd_de.SDID IS NOT NULL, sd_de.length_dimension,IF(sd_en.SDID IS NOT NULL, sd_en.length_dimension,'No Value')), IF (:LANG = 'en', IF(sd_en.SDID IS NOT NULL, sd_en.length_dimension,IF(sd_de.SDID IS NOT NULL, sd_de.length_dimension,'No Value')), 'No Translation')) AS length_dimension,
                IF (:LANG = 'de', IF(sd_de.SDID IS NOT NULL, sd_de.link_name,IF(sd_en.SDID IS NOT NULL, sd_en.link_name,'No Value')), IF (:LANG = 'en', IF(sd_en.SDID IS NOT NULL, sd_en.link_name,IF(sd_de.SDID IS NOT NULL, sd_de.link_name,'No Value')), 'No Translation')) AS sectionLink
                FROM
                gps_version AS gv
                LEFT JOIN gps_data AS gd ON gd.GVID = gv.GVID
                LEFT JOIN gps_type AS gt ON gt.GTID = gd.GTID
                LEFT JOIN river_description AS rd_de ON rd_de.RID = gd.RID AND rd_de.LANG = :DE AND rd_de.status = :STATUS
                LEFT JOIN river_description AS rd_en ON rd_en.RID = gd.RID AND rd_en.LANG = :EN AND rd_en.status = :STATUS
                LEFT JOIN section_description AS sd_de ON sd_de.SID = gd.SID AND sd_de.LANG = :DE AND sd_de.status = :STATUS
                LEFT JOIN section_description AS sd_en ON sd_en.SID = gd.SID AND sd_en.LANG = :EN AND sd_en.status = :STATUS
                WHERE gv.status = :STATUS AND gd.SID IS NOT NULL AND gd.type = :POLYLINE AND (polyline_tag = 'start' OR polyline_tag = 'middle' OR polyline_tag = 'end' )" . $sql, $data)['data'];


            $polyPoints = [];
            foreach ($result as $row) {
                if ($row['polyline_tag'] == 'start') $polyPoints[] = ['lat' => $row['lat'], 'lng' => $row['lng']];
                if ($row['polyline_tag'] == 'middle') {
                    $polyPoints[] = ['lat' => $row['lat'], 'lng' => $row['lng']];

                    // POLYLINE CENTER MARKER
                    if ($this->data->show_difficulty_marker) {
                        $polylineMarkerList[] = [
                            'CID' => $row['CID'],
                            'RID' => $row['RID'],
                            'SID' => $row['SID'],
                            'GTID' => $row['GTID'],
                            'lat' => $row['lat'],
                            'lng' => $row['lng'],
                            'filename' => $row['filename'],
                            'riverName' => $row['riverName'],
                            'riverLink' => $row['riverLink'],
                            'sectionName' => $row['sectionName'],
                            'sectionLink' => $row['sectionLink'],
                            'difficulty' => $row['difficulty'],
                            'best_season' => $row['best_season'],
                            'length' => $row['length'],
                            'length_dimension' => $row['length_dimension'],
                        ];
                    }
                }
                if ($row['polyline_tag'] == 'end') {
                    $polyPoints[] = ['lat' => $row['lat'], 'lng' => $row['lng']];

                    $polylineList[] = [
                        'CID' => $row['CID'],
                        'RID' => $row['RID'],
                        'SID' => $row['SID'],
                        'GTID' => $row['GTID'],
                        'distance' => $row['distance'],
                        'riverName' => $row['riverName'],
                        'sectionName' => $row['sectionName'],
                        'difficulty' => $row['difficulty'],
                        'best_season' => $row['best_season'],
                        'length' => $row['length'],
                        'length_dimension' => $row['length_dimension'],
                        'color' => $row['color'],
                        'data' => $polyPoints,
                    ];

                    $polyPoints = [];
                }
            }

        } else {
            // ALL DATA
            debug('REDUCE_POLYLINES disabled', DEBUGTYPE_INFO);
            $result = $this->db->query("SELECT
                gd.CID,
                gd.RID,
                gd.SID,
                gd.PID,
                gd.type,
                gd.GTID,
                gd.polyline_tag,
                gt.filename,
                gt.color,
                gd.random_name,
                gd.distance,
                gd.lat,
                gd.lng,
                IF (:LANG = 'de', IF(rd_de.RDID IS NOT NULL, rd_de.name,IF(rd_en.RDID IS NOT NULL, rd_en.name,'No Value')), IF (:LANG = 'en', IF(rd_en.RDID IS NOT NULL, rd_en.name,IF(rd_de.RDID IS NOT NULL, rd_de.name,'No Value')), 'No Translation')) AS riverName,
                IF (:LANG = 'de', IF(sd_de.SDID IS NOT NULL, sd_de.name,IF(sd_en.SDID IS NOT NULL, sd_en.name,'No Value')), IF (:LANG = 'en', IF(sd_en.SDID IS NOT NULL, sd_en.name,IF(sd_de.SDID IS NOT NULL, sd_de.name,'No Value')), 'No Translation')) AS sectionName,
                IF (:LANG = 'de', IF(sd_de.SDID IS NOT NULL, sd_de.difficulty,IF(sd_en.SDID IS NOT NULL, sd_en.difficulty,'No Value')), IF (:LANG = 'en', IF(sd_en.SDID IS NOT NULL, sd_en.difficulty,IF(sd_de.SDID IS NOT NULL, sd_de.difficulty,'No Value')), 'No Translation')) AS difficulty,
                IF (:LANG = 'de', IF(sd_de.SDID IS NOT NULL, sd_de.best_season,IF(sd_en.SDID IS NOT NULL, sd_en.best_season,'No Value')), IF (:LANG = 'en', IF(sd_en.SDID IS NOT NULL, sd_en.best_season,IF(sd_de.SDID IS NOT NULL, sd_de.best_season,'No Value')), 'No Translation')) AS best_season,
                IF (:LANG = 'de', IF(sd_de.SDID IS NOT NULL, sd_de.length,IF(sd_en.SDID IS NOT NULL, sd_en.length,'No Value')), IF (:LANG = 'en', IF(sd_en.SDID IS NOT NULL, sd_en.length,IF(sd_de.SDID IS NOT NULL, sd_de.length,'No Value')), 'No Translation')) AS length,
                IF (:LANG = 'de', IF(sd_de.SDID IS NOT NULL, sd_de.length_dimension,IF(sd_en.SDID IS NOT NULL, sd_en.length_dimension,'No Value')), IF (:LANG = 'en', IF(sd_en.SDID IS NOT NULL, sd_en.length_dimension,IF(sd_de.SDID IS NOT NULL, sd_de.length_dimension,'No Value')), 'No Translation')) AS length_dimension
                FROM
                gps_version AS gv
                LEFT JOIN gps_data AS gd ON gd.GVID = gv.GVID
                LEFT JOIN gps_type AS gt ON gt.GTID = gd.GTID
                LEFT JOIN river_description AS rd_de ON rd_de.RID = gd.RID AND rd_de.LANG = :DE AND rd_de.status = :STATUS
                LEFT JOIN river_description AS rd_en ON rd_en.RID = gd.RID AND rd_en.LANG = :EN AND rd_en.status = :STATUS
                LEFT JOIN section_description AS sd_de ON sd_de.SID = gd.SID AND sd_de.LANG = :DE AND sd_de.status = :STATUS
                LEFT JOIN section_description AS sd_en ON sd_en.SID = gd.SID AND sd_en.LANG = :EN AND sd_en.status = :STATUS
                WHERE gv.status = :STATUS" . $sql . " AND gd.type = :POLYLINE " . $sql . " GROUP BY gd.GDID", $data)['data'];

            $random_name = null;
            $polylineIndex = -1;
            foreach ($result as $row) {
                if ($random_name != $row['random_name']) {
                    $polylineIndex++;
                    $random_name = $row['random_name'];
                    $polylineList[] = [
                        'CID' => $row['CID'],
                        'RID' => $row['RID'],
                        'SID' => $row['SID'],
                        'GTID' => $row['GTID'],
                        'distance' => $row['distance'],
                        'riverName' => $row['riverName'],
                        'sectionName' => $row['sectionName'],
                        'difficulty' => $row['difficulty'],
                        'best_season' => $row['best_season'],
                        'length' => $row['length'],
                        'length_dimension' => $row['length_dimension'],
                        'color' => $row['color'],
                        'data' => array([
                            'lat' => $row['lat'],
                            'lng' => $row['lng']
                        ]),
                    ];

                } else {
                    $polylineList[$polylineIndex]['data'][] = [
                        'lat' => $row['lat'],
                        'lng' => $row['lng']
                    ];
                }

                if ($this->data->show_difficulty_marker == true) {
                    // POLYLINE CENTER MARKER
                    if ($row['polyline_tag'] == 'middle') {
                        $polylineMarkerList[] = [
                            'CID' => $row['CID'],
                            'RID' => $row['RID'],
                            'SID' => $row['SID'],
                            'GTID' => $row['GTID'],
                            'lat' => $row['lat'],
                            'lng' => $row['lng'],
                            'filename' => $row['filename'],
                            'riverName' => $row['riverName'],
                            'sectionName' => $row['sectionName'],
                        ];
                    }
                }
            }
        }

        // GENERATE MARKER
        if ($this->data->show_marker == true) {
            $data['MARKER'] = 'marker';
            unset($data['POLYLINE']);
            $result = $this->db->query("SELECT
                gd.CID,
                gd.RID,
                gd.SID,
                gd.PID,
                gd.type,
                gd.GTID,
                gt.filename,
                gd.random_name,
                gd.distance,
                gd.lat,
                gd.lng,
                IF (:DE = :LANG, rd_de.name, rd_en.name) AS rivername,
                IF (:DE = :LANG, sd_de.name, sd_en.name) AS sectionname,
                IF (:DE = :LANG, sd_de.difficulty, sd_en.difficulty) AS difficulty,
                IF (:DE = :LANG, sd_de.best_season, sd_en.best_season) AS best_season,
                IF (:DE = :LANG, sd_de.length, sd_en.length) AS length,
                IF (:DE = :LANG, sd_de.length_dimension, sd_en.length_dimension) AS length_dimension
                FROM
                gps_version AS gv
                LEFT JOIN gps_data AS gd ON gd.GVID = gv.GVID
                LEFT JOIN gps_type AS gt ON gt.GTID = gd.GTID
                LEFT JOIN river_description AS rd_de ON rd_de.RID = gd.RID AND rd_de.LANG = :DE AND rd_de.status = :STATUS
                LEFT JOIN river_description AS rd_en ON rd_en.RID = gd.RID AND rd_en.LANG = :EN AND rd_en.status = :STATUS
                LEFT JOIN section_description AS sd_de ON sd_de.SID = gd.SID AND sd_de.LANG = :DE AND sd_de.status = :STATUS
                LEFT JOIN section_description AS sd_en ON sd_en.SID = gd.SID AND sd_en.LANG = :EN AND sd_en.status = :STATUS
                WHERE gv.status = :STATUS AND gd.type = :MARKER" . $sql . " GROUP BY gd.GDID", $data)['data'];
            foreach ($result as $row) {
                $markerList[] = [
                    'CID' => $row['CID'],
                    'RID' => $row['RID'],
                    'SID' => $row['SID'],
                    'GTID' => $row['GTID'],
                    'lat' => $row['lat'],
                    'lng' => $row['lng'],
                    'filename' => $row['filename']
                ];
            }
        }

        $this->response->markerList = $markerList;
        $this->response->polylineList = $polylineList;
        $this->response->polylineMarkerList = $polylineMarkerList;
        $this->response->gpsTypeList = $this->getGpsType();
    }

    public function getGpsTypeList()
    {
        $this->response->gpsTypeList = [
            "marker" => $this->db->query("SELECT * FROM gps_type WHERE marker = 1")['data'],
            "polyline" => $this->db->query("SELECT * FROM gps_type WHERE polyline = 1")['data']
        ];
    }

    private function getGpsType()
    {
        $res = $this->db->query("SELECT * FROM gps_type")['data'];
        $typePolyline = [];
        $typePolylineArray = [];
        $typeMarker = [];
        $typeMarkerArray = [];
        foreach ($res as $row) {
            if ($row['polyline'] == 1) {
                $typePolyline[$row['GTID']] = ['GTID' => $row['GTID'], 'filename' => $row['filename'], 'color' => $row['color'], 'translate' => $row['translate']];
                $typePolylineArray[] = ['GTID' => $row['GTID'], 'filename' => $row['filename'], 'color' => $row['color'], 'translate' => $row['translate']];
            }
            if ($row['marker'] == 1) {
                $typeMarker[$row['GTID']] = ['GTID' => $row['GTID'], 'filename' => $row['filename'], 'translate' => $row['translate']];
                $typeMarkerArray[] = ['GTID' => $row['GTID'], 'filename' => $row['filename'], 'translate' => $row['translate']];
            }
        }

        return ['polyline' => $typePolyline, 'polylineArray' => $typePolylineArray, 'marker' => $typeMarker, 'markerArray' => $typeMarkerArray];
    }
}
