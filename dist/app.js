"use strict";
/**
    MIT License

    Copyright (c) 2019 Nicolas Klier

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
exports.__esModule = true;
var crypto = require("crypto");
var minimist = require("minimist");
var chalk_1 = require("chalk");
/**
 * Diese Klasse repräsentiert einen einzigen Block und
 * enthält die Struktur eines Blockes
 */
var Block = /** @class */ (function () {
    function Block(blockchain, index, previous_hash, from, to, message) {
        // Header
        this.index = null;
        this.createdAt = null;
        this.previous_hash = null;
        this.hash = null;
        this.nonce = null;
        // Body
        this.from = null;
        this.to = null;
        this.message = null;
        // Additional (nicht relevant für Block)
        this.calcTime = null;
        this.blockchain = null;
        this.blockchain = blockchain;
        this.index = index;
        this.hash = "";
        this.createdAt = new Date().getTime();
        this.previous_hash = previous_hash;
        this.nonce = 0;
        this.from = from;
        this.to = to;
        this.message = message;
    }
    /**
     * Diese Funktion errechnet den Hash eines Blockes und setzt ihn automatisch.
     */
    Block.prototype.calculateHash = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var startTime, _a, endTime, err_1;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 4, , 5]);
                                    startTime = new Date().getTime();
                                    _b.label = 1;
                                case 1:
                                    if (!!this.hash.startsWith(this.blockchain.getHashStart())) return [3 /*break*/, 3];
                                    this.nonce++;
                                    _a = this;
                                    return [4 /*yield*/, this.sha256(this.mergeData())];
                                case 2:
                                    _a.hash = _b.sent();
                                    return [3 /*break*/, 1];
                                case 3:
                                    endTime = new Date().getTime();
                                    this.calcTime = endTime - startTime;
                                    resolve(this.hash);
                                    return [3 /*break*/, 5];
                                case 4:
                                    err_1 = _b.sent();
                                    reject(err_1);
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Diese Funktion errechnet den Hash eines Blockes (SHA-256)
     */
    Block.prototype.sha256 = function (toHash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        try {
                            var hash = crypto.createHash('sha256');
                            hash.update(toHash, 'utf8');
                            var calcHash = hash.digest('hex');
                            resolve(calcHash);
                        }
                        catch (err) {
                            reject(err);
                        }
                    })];
            });
        });
    };
    /**
     * Diese Funktion packt alle Informationen die für das errechnen
     * des Hashes gebraucht werden zusammen.
     */
    Block.prototype.mergeData = function () {
        return this.from + this.to + this.message + this.createdAt + this.previous_hash + this.index + this.nonce;
    };
    return Block;
}());
/**
 * Diese Klasse ist die eigentlich Blockchain und beinhaltet einen
 * Array an Blöcken in sich und notwendige Funktionen.
 */
var Chain = /** @class */ (function () {
    function Chain(difficulty) {
        this.chain = [];
        this.difficulty = difficulty || 4;
    }
    /**
     * Diese Funktion erstellt einen neuen Block und hängt
     * diesen auch an die Blockchain.
     * @param from Sender der Nachricht
     * @param to Empfänger der Nachricht
     * @param message Inhalt der Nachricht
     */
    Chain.prototype.addBlock = function (from, to, message) {
        return __awaiter(this, void 0, void 0, function () {
            var nextIndex, newBlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nextIndex = this.chain.length;
                        newBlock = new Block(this, nextIndex, this.chain[nextIndex - 1].hash, from, to, message);
                        return [4 /*yield*/, newBlock.calculateHash()];
                    case 1:
                        _a.sent();
                        this.chain.push(newBlock);
                        console.log("Generierte Block #" + newBlock.index + ": " + newBlock.hash + " (" + (newBlock.calcTime / 1000).toFixed(2) + "s)");
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Diese Funktion erstellt den Genesis Block.
     */
    Chain.prototype.generateGenesisBlock = function () {
        return __awaiter(this, void 0, void 0, function () {
            var genesisBlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.chain.length == 0)) return [3 /*break*/, 2];
                        genesisBlock = new Block(this, 0, "", "admin", "admin2", "Genesis block");
                        return [4 /*yield*/, genesisBlock.calculateHash()];
                    case 1:
                        _a.sent();
                        this.chain.push(genesisBlock);
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Chain.prototype.validate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var wrongBlocks, i, previous_block, block, blockHash, newHash;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    wrongBlocks = [];
                                    i = 0;
                                    _a.label = 1;
                                case 1:
                                    if (!(i < this.chain.length)) return [3 /*break*/, 5];
                                    previous_block = this.chain[i - 1];
                                    block = this.chain[i];
                                    console.log("\u00DCberpr\u00FCfe Block #" + block.index + " ...");
                                    // Überprüfe ob der 'previous_hash' stimmt
                                    if (block.index > 0) {
                                        if (block.previous_hash == previous_block.hash) {
                                            console.log(chalk_1["default"].green("\t-> previous_hash stimmt"));
                                        }
                                        else {
                                            console.log(chalk_1["default"].red("\t-> !! previous_hash manipuliert !!"));
                                            wrongBlocks.push(block);
                                        }
                                    }
                                    if (!block.hash.startsWith(this.getHashStart())) return [3 /*break*/, 3];
                                    blockHash = block.hash;
                                    return [4 /*yield*/, block.sha256(block.mergeData())];
                                case 2:
                                    newHash = _a.sent();
                                    if (newHash == blockHash) {
                                        console.log(chalk_1["default"].green("\t-> Hash ist korrekt"));
                                    }
                                    else {
                                        console.log(chalk_1["default"].red("\t-> !! Hash ist falsch !!"));
                                        wrongBlocks.push(block);
                                    }
                                    return [3 /*break*/, 4];
                                case 3:
                                    console.log(chalk_1["default"].red("\t-> !! Hash startet nicht mit " + this.difficulty + " Nullen !!"));
                                    wrongBlocks.push(block);
                                    _a.label = 4;
                                case 4:
                                    i++;
                                    return [3 /*break*/, 1];
                                case 5:
                                    resolve(wrongBlocks);
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    Chain.prototype.getHashStart = function () {
        var returnString = "";
        for (var i = 1; i <= this.difficulty; i++) {
            returnString += "0";
        }
        return returnString;
    };
    return Chain;
}());
/**
 * Erstellt eine zufällige Zahl zwischen `min` und `max`
 */
function random(min, max) {
    return Math.random() * (max - min) + min;
}
/**
 * Asyn­chrone Funktion die direkt beim Start gestartet wird.
 */
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var user_arguments, difficulty, with_errors, random_blocks, no_validation, show_help, USERS, blockchain, i, people, messages, from, to, message, blockchainValidation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user_arguments = minimist(process.argv.slice(2));
                    difficulty = user_arguments.d || 4;
                    with_errors = user_arguments.e || false;
                    random_blocks = user_arguments.z || 0;
                    no_validation = user_arguments.novalid || false;
                    show_help = user_arguments.help || false;
                    if (show_help) {
                        console.log("\nEine Liste an Argumenten die benutzt werden können um die Erstellung der Blockchain zu verändern:\n--------------------");
                        console.log("Nutzen: node app.js [ARGUMENTE]");
                        console.log(chalk_1["default"].bold("\nARGUMENTE"));
                        console.log("\t-d [DIFFICULTY]\t - Legt fest wie viele Nullen der Hash am Anfang haben soll (standard: 4)");
                        console.log("\n\t-e\t\t - Die Blockchain wird nach der Erstellung verändert (standard: false)");
                        console.log("\n\t-z [ZAHL]\t - Anzahl zufällig erstellter Blöcker (standard: 0)");
                        console.log("\n\t--novalid\t - Keine Validierung der Blockchain durchführen (standard: false)\n");
                        return [2 /*return*/];
                    }
                    (function (USERS) {
                        USERS["USER1"] = "Mondei1";
                        USERS["USER2"] = "GoodbyeDarkness";
                        USERS["USER3"] = "youngLarry";
                    })(USERS || (USERS = {}));
                    blockchain = new Chain(difficulty);
                    console.log("Erstelle Bl\u00F6cke (difficulty: " + difficulty + " | mit fehlern? " + with_errors + ") ...\n============================");
                    return [4 /*yield*/, blockchain.generateGenesisBlock()];
                case 1:
                    _a.sent(); // Erstelle Genesis Block (setup)
                    // Konversation 1
                    return [4 /*yield*/, blockchain.addBlock(USERS.USER1, USERS.USER2, "Hey, wie geht es dir? Der Urlaub ist wohl bald rum?")];
                case 2:
                    // Konversation 1
                    _a.sent();
                    return [4 /*yield*/, blockchain.addBlock(USERS.USER2, USERS.USER1, "Mir geht es super, danke der Nachfrage! Freue mich aber wieder bald zuhause zu sein. " +
                            "Aber bitte erinnere mich nicht daran das in zwei Tagen wieder Schule ist D:")];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, blockchain.addBlock(USERS.USER1, USERS.USER2, "Tchja, in zwei Tagen ist wieder Schule (: War der Urlaub wirklich so schlimm?")];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, blockchain.addBlock(USERS.USER1, USERS.USER2, "Hattest du im Urlaub Zeit diese eine Hausaufgabe für Mathe zu machen?")
                        // Konversation 2
                    ];
                case 5:
                    _a.sent();
                    // Konversation 2
                    return [4 /*yield*/, blockchain.addBlock(USERS.USER3, USERS.USER1, "Sag mal, kannst du mir mal die Hausaufgaben von gestern schicken. Bin zu faul die jetzt zu machen ¯\\_(ツ)_/¯")];
                case 6:
                    // Konversation 2
                    _a.sent();
                    return [4 /*yield*/, blockchain.addBlock(USERS.USER1, USERS.USER3, "Hab die selber nicht. Leider ist unser alleswisser " + USERS.USER2 + " noch im Urlaub, habe ihn aber gerade gefragt aber ich hab noch keine Antwort.")
                        // Zufällige Nachrichten
                    ];
                case 7:
                    _a.sent();
                    i = 0;
                    _a.label = 8;
                case 8:
                    if (!(i < random_blocks)) return [3 /*break*/, 11];
                    people = ["Mondei1", "GoodbyeDarknes", "youngLarry", "thatminer", "Ray", "Eisenfell", "locumat", "Mori", "DerTim"];
                    messages = [
                        "Das ist eine zufällige Nachricht die ich an dich sende.",
                        "Was für eine Zufall nicht wahr?",
                        "lol, wieso dieser Zufall?",
                        "Manchmal frage ich mich ob das Zufall ist.",
                        "Letztens war das echt zufällig.",
                        "Hätte er nicht so zufällig diese Zahl gewürfelt, hätte ich gewonnen.",
                        "Also ich glaube nicht an Zufall, du?",
                        "Doch, also ich glaube an Zufall.",
                        "Wusstest du das ein Computer keinen echten Zufall erstellen kann?",
                        "Zufallsrechnung in Mathe ist langweilig.",
                        "Vielleicht gewinne per Zufall im Lotto."
                    ];
                    from = people[random(0, people.length - 1).toFixed(0)];
                    to = people[random(0, people.length - 1).toFixed(0)];
                    message = messages[random(0, messages.length - 1).toFixed(0)];
                    return [4 /*yield*/, blockchain.addBlock(from, to, message)];
                case 9:
                    _a.sent();
                    _a.label = 10;
                case 10:
                    i++;
                    return [3 /*break*/, 8];
                case 11:
                    if (with_errors) {
                        blockchain.chain[1].hash = "0000ab1bcff2";
                        blockchain.chain[2].createdAt = 1557165712342;
                        blockchain.chain[5].message = "Kannst du mir mal die Hausaufgaben schicken du Hur**sohn?";
                    }
                    console.log(blockchain.chain);
                    if (!!no_validation) return [3 /*break*/, 13];
                    console.log("\n\n\n");
                    return [4 /*yield*/, blockchain.validate()];
                case 12:
                    blockchainValidation = _a.sent();
                    if (blockchainValidation.length == 0) {
                        console.log(chalk_1["default"].bold(chalk_1["default"].green("Blockchain ist komplett valide!")));
                    }
                    else {
                        console.log(chalk_1["default"].bold(chalk_1["default"].red("Blockchain hat " + blockchainValidation.length + " fehlerhafte Bl\u00F6cke:")));
                        console.log(blockchainValidation);
                    }
                    _a.label = 13;
                case 13: return [2 /*return*/];
            }
        });
    });
}
run();
