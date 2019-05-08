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

import * as crypto from 'crypto';
import * as minimist from 'minimist';
import chalk from 'chalk';

/**
 * Diese Klasse repräsentiert einen einzigen Block und
 * enthält die Struktur eines Blockes
 */
class Block {
    // Header
    index: number = null;
    createdAt: number = null;
    previous_hash: string = null;
    hash: string = null;
    nonce: number = null;

    // Body
    from: string = null;
    to: string = null;
    message: string = null;

    // Additional (nicht relevant für Block)
    calcTime: number = null;
    blockchain: Chain = null;

    constructor(blockchain: Chain, index: number, previous_hash: string, from: string, to: string, message: string) {
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
    async calculateHash(): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            try {
                const startTime = new Date().getTime();
                // Schleife die nur endet, wenn der Hash mit x Nullen anfängt. (difficulty)
                while(!this.hash.startsWith(this.blockchain.getHashStart())) {
                    this.nonce++;
                    this.hash = await this.sha256(this.mergeData());
                }
                const endTime = new Date().getTime();
                this.calcTime = endTime - startTime;
                resolve(this.hash);
            } catch(err) {
                reject(err)
            }            
        })
    }

    /**
     * Diese Funktion errechnet den Hash eines Blockes (SHA-256)
     */
    async sha256(toHash: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                let hash = crypto.createHash('sha256');
                hash.update(toHash, 'utf8');
                const calcHash = hash.digest('hex');
                resolve(calcHash);
            } catch(err) {
                reject(err)
            }            
        })
    }

    /**
     * Diese Funktion packt alle Informationen die für das errechnen
     * des Hashes gebraucht werden zusammen.
     */
    mergeData() {
        return this.from+this.to+this.message+this.createdAt+this.previous_hash+this.index+this.nonce;
    }
}

/**
 * Diese Klasse ist die eigentlich Blockchain und beinhaltet einen
 * Array an Blöcken in sich und notwendige Funktionen.
 */
class Chain {
    chain: Array<Block>;
    difficulty: number;
    constructor(difficulty?: number) {
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
    async addBlock(from: string, to: string, message: string) {
        const nextIndex = this.chain.length;
        const newBlock: Block = new Block(this, nextIndex, this.chain[nextIndex-1].hash, from, to, message);
        await newBlock.calculateHash();
        this.chain.push(newBlock);

        console.log(`Generierte Block #${newBlock.index}: ${newBlock.hash} (${(newBlock.calcTime/1000).toFixed(2)}s)`);
    }

    /**
     * Diese Funktion erstellt den Genesis Block.
     */
    async generateGenesisBlock() {
        // Nur starten, wenn es noch keinen einzigen Block gibt
        if(this.chain.length == 0) {
            const genesisBlock: Block = new Block(this, 0, "", "admin", "admin2", "Genesis block");
            await genesisBlock.calculateHash();
            this.chain.push(genesisBlock);
        }
    }

    async validate(): Promise<Array<Block>> {
        return new Promise<Array<Block>>(async (resolve, reject) => {
            const wrongBlocks: Array<Block> = [];
            for(let i = 0; i < this.chain.length; i++) {
                const previous_block = this.chain[i-1];
                const block: Block = this.chain[i];
                console.log(`Überprüfe Block #${block.index} ...`);
                
                // Überprüfe ob der 'previous_hash' stimmt
                if(block.index > 0) {
                    if(block.previous_hash == previous_block.hash) {
                        console.log(chalk.green("\t-> previous_hash stimmt"))
                    } else {
                        console.log(chalk.red("\t-> !! previous_hash manipuliert !!"))
                        wrongBlocks.push(block);
                    }
                }
    
                // Überprüfe ob der eigene Hash stimmt
                // Startet der Hash mit x Nullen?
                if(block.hash.startsWith(this.getHashStart())) {
                    // Stimmt der Hash allgemein?
                    const blockHash: string = block.hash;
                    const newHash = await block.sha256(block.mergeData());
                    if(newHash == blockHash) {
                        console.log(chalk.green("\t-> Hash ist korrekt"))
                    } else {
                        console.log(chalk.red("\t-> !! Hash ist falsch !!"))
                        wrongBlocks.push(block);
                    }
                } else {
                    console.log(chalk.red(`\t-> !! Hash startet nicht mit ${this.difficulty} Nullen !!`))
                    wrongBlocks.push(block);
                }
            }
            resolve(wrongBlocks);
        })
    }

    getHashStart() {
        let returnString = "";
        for(let i = 1; i <= this.difficulty; i++) {
            returnString += "0";
        }
        return returnString;
    }
}

/**
 * Erstellt eine zufällige Zahl zwischen `min` und `max`
 */
function random(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Asyn­chrone Funktion die direkt beim Start gestartet wird.
 */
async function run() {
    // Kommandozeile Parameter
    const user_arguments: any = minimist(process.argv.slice(2));
    const difficulty = user_arguments.d || 4;
    const with_errors: boolean = user_arguments.e || false;
    const random_blocks: number = user_arguments.z || 0;
    const no_validation: boolean = user_arguments.novalid || false;
    const show_help: boolean = user_arguments.help || false;

    if(show_help) {
        console.log("\nEine Liste an Argumenten die benutzt werden können um die Erstellung der Blockchain zu verändern:\n--------------------");
        console.log("Nutzen: node app.js [ARGUMENTE]");
        console.log(chalk.bold("\nARGUMENTE"));
        console.log("\t-d [DIFFICULTY]\t - Legt fest wie viele Nullen der Hash am Anfang haben soll (standard: 4)");
        console.log("\n\t-e\t\t - Die Blockchain wird nach der Erstellung verändert (standard: false)");
        console.log("\n\t-z [ZAHL]\t - Anzahl zufällig erstellter Blöcker (standard: 0)");
        console.log("\n\t--novalid\t - Keine Validierung der Blockchain durchführen (standard: false)\n")
        return;
    }

    // Ein paar Benutzer
    enum USERS {
        USER1 = "Mondei1",
        USER2 = "GoodbyeDarkness",
        USER3 = "youngLarry"
    }
    const blockchain: Chain = new Chain(difficulty);
    
    console.log(`Erstelle Blöcke (difficulty: ${difficulty} | mit fehlern? ${with_errors}) ...\n============================`)
    await blockchain.generateGenesisBlock();  // Erstelle Genesis Block (setup)

    // Konversation 1
    await blockchain.addBlock(USERS.USER1, USERS.USER2, "Hey, wie geht es dir? Der Urlaub ist wohl bald rum?");
    await blockchain.addBlock(USERS.USER2, USERS.USER1, "Mir geht es super, danke der Nachfrage! Freue mich aber wieder bald zuhause zu sein. " +
    "Aber bitte erinnere mich nicht daran das in zwei Tagen wieder Schule ist D:");
    await blockchain.addBlock(USERS.USER1, USERS.USER2, "Tchja, in zwei Tagen ist wieder Schule (: War der Urlaub wirklich so schlimm?");
    await blockchain.addBlock(USERS.USER1, USERS.USER2, "Hattest du im Urlaub Zeit diese eine Hausaufgabe für Mathe zu machen?")

    // Konversation 2
    await blockchain.addBlock(USERS.USER3, USERS.USER1, "Sag mal, kannst du mir mal die Hausaufgaben von gestern schicken. Bin zu faul die jetzt zu machen ¯\\_(ツ)_/¯");
    await blockchain.addBlock(USERS.USER1, USERS.USER3, "Hab die selber nicht. Leider ist unser alleswisser " + USERS.USER2 + " noch im Urlaub, habe ihn aber gerade gefragt aber ich hab noch keine Antwort.")

    // Zufällige Nachrichten
    for(let i = 0; i < random_blocks; i++) {
        const people: Array<string> = ["Mondei1", "GoodbyeDarknes", "youngLarry", "thatminer", "Ray", "Eisenfell", "locumat", "Mori", "DerTim"];
        const messages: Array<string> = [
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
        ]
        const from: string = people[random(0, people.length-1).toFixed(0)];
        const to: string = people[random(0, people.length-1).toFixed(0)];
        const message: string = messages[random(0, messages.length-1).toFixed(0)];
        await blockchain.addBlock(from, to, message);
    }

    if(with_errors) {
        blockchain.chain[1].hash = "0000ab1bcff2";
        blockchain.chain[2].createdAt = 1557165712342;
        blockchain.chain[5].message = "Kannst du mir mal die Hausaufgaben schicken du Hur**sohn?";
    }

    console.log(blockchain.chain);

    if(!no_validation) {
        console.log("\n\n\n");
        const blockchainValidation: Array<Block> = await blockchain.validate();
        if(blockchainValidation.length == 0) {
            console.log(chalk.bold(chalk.green("Blockchain ist komplett valide!")));
        } else {
            console.log(chalk.bold(chalk.red(`Blockchain hat ${blockchainValidation.length} fehlerhafte Blöcke:`)));
            console.log(blockchainValidation);
        }
    }
}

run();