/**
 * -----------------------------------------------------------
 * Loading dependencies
 * -----------------------------------------------------------
 */
var CryptoJS = require("crypto-js");
eval(pm.environment.get('pmlib_code'));


/**
 * -----------------------------------------------------------
 * Helpers
 * -----------------------------------------------------------
 */

function hexToBase64(hexstring) {
    return btoa(hexstring.match(/\w{2}/g).map(function (a) {
        return String.fromCharCode(parseInt(a, 16));
    }).join(""));
}

/**
 * -----------------------------------------------------------
 * AES encryption setup
 * -----------------------------------------------------------
 */

// Generating unique AES key
var aesKey = CryptoJS.lib.WordArray.random(16);

// Generating initialization vector for AES encryption
var aesIv = CryptoJS.lib.WordArray.random(8);
// aesIv can be used as a postman variable
// pm.variables.set("IV", aesIv.toString());


/**
 * Encrypting data with AES algorithm
 * @param {object} data JSON data to be encrypted
 * @returns string
 */
function aesEncrypt(data) {
    var encodedData = CryptoJS.enc.Utf8.parse(JSON.stringify(data));
    var encrypted = CryptoJS.AES.encrypt(encodedData, aesKey, {
        iv: CryptoJS.enc.Hex.parse(aesIv),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    }).toString();

    return CryptoJS.enc.Base64.parse(encrypted).toString(CryptoJS.enc.Hex);
}


/**
 * -----------------------------------------------------------
 * RSA encryption setup
 * -----------------------------------------------------------
 */

// Loading and generating public key for data encryption
// The key can be hard-coded or can be loaded from environment variable
const publicKeyString = '-----BEGIN PUBLIC KEY-----\n' +
    pm.environment.get("PUBLIC_KEY_STRING") + '\n' +
    '-----END PUBLIC KEY-----\n';
const publicKey = pmlib.rs.KEYUTIL.getKey(publicKeyString);


/**
 * -----------------------------------------------------------
 * Bootstrapping request
 * -----------------------------------------------------------
 */

// Request body
var requestData = {
    "paymentCode": "c2d7633de0e9518ec907"
};


// Encrypting request body with AES
var aesEncryptedRequestData = aesEncrypt(requestData);
// pm.variables.set("ENCRYPTED_REQUEST_DATA", aesEncryptedRequestData);


// Encrypting request body with RSA
var rsaEncryptedRequestData = pmlib.rs.KJUR.crypto.Cipher.encrypt(requestData, publicKey, 'RSAOAEP');
var rsaEncryptedRequestDataB64 = hexToBase64(rsaEncryptedRequestData);
// pm.variables.set("ENCRYPTED_REQUEST_DATA", rsaEncryptedRequestDataB64);