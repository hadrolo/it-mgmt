<?php

/**
 * Encrypts/decrypts a string in a way that is compatible with the JavaScript's crypto-js library.
 * Requires a CRYPTO_KEY with 32 characters length.
 */
class Crypto
{

    public static function encrypt(string $plaintext): string
    {
        $iv = bin2hex(random_bytes(8)); // random initialization vector
        $encrypted = $iv . openssl_encrypt($plaintext, "AES-256-CBC", FRAMEWORK['CRYPTO_KEY'], 0, $iv);
        return bin2hex(base64_decode($encrypted)); // convert to hex to be URL safe
    }

    public static function decrypt(string $ciphertext): string
    {
        $ciphertext = base64_encode(hex2bin($ciphertext));
        $iv = substr($ciphertext, 0, 16);
        $ciphertext = substr($ciphertext, 16);
        return openssl_decrypt($ciphertext, "AES-256-CBC", FRAMEWORK['CRYPTO_KEY'], 0, $iv);
    }
}
