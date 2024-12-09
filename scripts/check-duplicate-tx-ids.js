"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var util_base64_node_1 = require("@aws-sdk/util-base64-node");
var node_util_1 = require("node:util");
var AWSCrypto = require("@aws-crypto/client-node");
function findDuplicateTaxIds(directory) {
    var _this = this;
    var taxIdMap = new Map();
    var count = 0;
    // Iterate over all files in the specified directory
    var files = fs.readdirSync(directory);
    files.forEach(function (filename) {
        if (filename.endsWith(".json")) {
            console.log("Reading ".concat(filename));
            var filepath = path.join(directory, filename);
            try {
                var fileContent = fs.readFileSync(filepath, "utf-8");
                var data = JSON.parse(fileContent);
                data.Items.forEach(function (user) {
                    var _a;
                    count++;
                    var userId = user.userId;
                    console.log("\tProcessing user #".concat(count, ", userId: ").concat(userId));
                    var businesses = ((_a = user.data) === null || _a === void 0 ? void 0 : _a.businesses) || {};
                    // Iterate over each business and extract the encrypted tax ID
                    Object.entries(businesses).forEach(function (_a) {
                        var _b, _c;
                        var businessId = _a[0], businessData = _a[1];
                        var encryptedTaxId = (_b = businessData.profileData) === null || _b === void 0 ? void 0 : _b.encryptedTaxId;
                        if (encryptedTaxId) {
                            if (!taxIdMap.has(encryptedTaxId)) {
                                taxIdMap.set(encryptedTaxId, []);
                            }
                            (_c = taxIdMap.get(encryptedTaxId)) === null || _c === void 0 ? void 0 : _c.push({ userId: userId, businessId: businessId });
                        }
                    });
                });
            }
            catch (error) {
                console.error("Error reading or parsing file: ".concat(filename), error);
            }
        }
    });
    // Check for duplicates and print them
    taxIdMap.forEach(function (entries, encryptedTaxId) {
        if (entries.length > 1) {
            console.log("\n");
            console.log("Duplicate encryptedTaxId found: ".concat(encryptedTaxId));
            entries.forEach(function (_a) {
                var userId = _a.userId, businessId = _a.businessId;
                console.log("  UserId: ".concat(userId, ", BusinessId: ").concat(businessId));
            });
        }
    });
    var AWSEncryptionDecryptionFactory = function (generatorKeyId, context) {
        var _a = AWSCrypto.buildClient(AWSCrypto.CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT), encrypt = _a.encrypt, decrypt = _a.decrypt;
        var keyring = new AWSCrypto.KmsKeyringNode({ generatorKeyId: generatorKeyId });
        var decoder = new node_util_1.TextDecoder();
        var encryptValue = function (plainTextTaxId) { return __awaiter(_this, void 0, void 0, function () {
            var result, base64TaxId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, encrypt(keyring, plainTextTaxId, {
                            encryptionContext: context,
                        })];
                    case 1:
                        result = (_a.sent()).result;
                        base64TaxId = (0, util_base64_node_1.toBase64)(result);
                        return [2 /*return*/, base64TaxId];
                }
            });
        }); };
        var decryptValue = function (encryptedTaxId) { return __awaiter(_this, void 0, void 0, function () {
            var bufferedTaxId, _a, plaintext, messageHeader, encryptionContext, _i, _b, _c, key, value, decodedTaxId;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        bufferedTaxId = (0, util_base64_node_1.fromBase64)(encryptedTaxId);
                        return [4 /*yield*/, decrypt(keyring, bufferedTaxId)];
                    case 1:
                        _a = _d.sent(), plaintext = _a.plaintext, messageHeader = _a.messageHeader;
                        encryptionContext = messageHeader.encryptionContext;
                        for (_i = 0, _b = Object.entries(context); _i < _b.length; _i++) {
                            _c = _b[_i], key = _c[0], value = _c[1];
                            if (encryptionContext[key] !== value) {
                                throw new Error("Encryption Context does not match expected values");
                            }
                        }
                        decodedTaxId = decoder.decode(plaintext);
                        return [2 /*return*/, decodedTaxId];
                }
            });
        }); };
        return { encryptValue: encryptValue, decryptValue: decryptValue };
    };
}
// Specify the directory containing the JSON files
var jsonDirectory = "/Users/jhechter/Desktop/converted_data";
findDuplicateTaxIds(jsonDirectory);
