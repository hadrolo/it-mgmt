<?php

class Translation
{

    /**
     * Returns all translations for a language as an object.
     *
     * @param string $language
     * @return object
     */
    public static function getAll(string $language): object
    {
        $transFW = json_decode(file_get_contents(ASSET_ROOT . "framework/i18n/" . $language . ".json"));
        $transApp = json_decode(file_get_contents(ASSET_ROOT . "i18n/" . $language . ".json"));

        return (object)array_merge((array)$transFW, (array)$transApp);
    }

}
