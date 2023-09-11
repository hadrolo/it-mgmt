<?php

use Firebase\JWT\ExpiredException;
use Firebase\JWT\JWT;

class TokenFactory
{

    public static function newToken(int $uid, bool $logout = false): array
    {
        $token = [
            "exp" => time() + FRAMEWORK['MODULES']['AUTH']['ACCESS_TOKEN_TIME'],
            "data" => [
                'UID' => $uid,
            ]
        ];

        $refresh_token = [
            "exp" => time() + FRAMEWORK['MODULES']['AUTH']['REFRESH_TOKEN_TIME'],
            "data" => [
                'UID' => $uid,
            ]
        ];

        $aToken = JWT::encode($token, FRAMEWORK['MODULES']['AUTH']['JWT_KEY']);
        $rToken = JWT::encode($refresh_token, FRAMEWORK['MODULES']['AUTH']['JWT_KEY']);

        return [
            'anonymous' => $uid === 0,
            'accessToken' => $aToken,
            'refreshToken' => $rToken,
            'logout' => $logout, // TODO: required?
        ];
    }

    public static function refreshToken(string $refreshToken): array
    {
        try {
            $decoded = JWT::decode($refreshToken, FRAMEWORK['MODULES']['AUTH']['JWT_KEY'], ['HS256']);
            return self::newToken($decoded->data->UID);
        } catch (ExpiredException|UnexpectedValueException $e) {
            return self::newToken(0, true);
        }
    }
}
