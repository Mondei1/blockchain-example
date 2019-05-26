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
                    this.hash = await sha256(this.mergeData());
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
            console.log("Genesis Block erstellt #0: " + genesisBlock.hash);
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
                    const newHash = await sha256(block.mergeData());
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
 * Asyn­chrone Funktion die direkt beim Start gestartet wird.
 */
async function run() {
    const startTime = Date.now();
    // Kommandozeile Parameter
    const user_arguments: any = minimist(process.argv.slice(2));
    const difficulty = user_arguments.d || 4;
    const random_blocks: number = user_arguments.z || 0;
    const no_validation: boolean = user_arguments.novalid || false;
    const show_help: boolean = user_arguments.help || false;
    const hide_blockchain: boolean = user_arguments.noshow || false;
    let manipulate_blocks = user_arguments.m || [-1];
    if(typeof manipulate_blocks === 'number') manipulate_blocks = [manipulate_blocks];  // In einen Array umwandeln

    if(show_help) {
        console.log("\nEine Liste an Argumenten die benutzt werden können um die Erstellung der Blockchain zu verändern:\n--------------------");
        console.log("Nutzen: node app.js [ARGUMENTE]");
        console.log(chalk.bold("\nARGUMENTE"));
        console.log("\t-d [DIFFICULTY]\t - Legt fest wie viele Nullen der Hash am Anfang haben soll (standard: 4)");
        console.log("\n\t-z [ZAHL]\t - Anzahl zufällig erstellter Blöcker (standard: 0)");
        console.log("\n\t-m [BLOCK INDEX] - Manipuliert einen bestimmten Block (standard: keiner)\n");
        console.log("\n\t--novalid\t - Keine Validierung der Blockchain durchführen (standard: false)");
        console.log("\n\t--noshow\t - Zeigt die Blockchain nicht an (standard: false)");
        console.log(chalk.bold("\nBEISPIELE"));
        console.log("\tnode app.js -d 2 -z 900 -m 50 -m 51\t - Schwierigkeit ist 2, erstellt 900 zufällige Blöcke und manipuliert Block 50 und 51.");
        console.log("\tnode app.js -d 3\t\t\t - Erstellt alle sechs Standard Blöcke mit einer Schwierigkeit von 3.");
        return;
    }

    // Ein paar Benutzer
    enum USERS {
        USER1 = "Mondei1",
        USER2 = "GoodbyeDarkness",
        USER3 = "youngLarry"
    }
    const blockchain: Chain = new Chain(difficulty);
    
    console.log(`Erstelle Blöcke ...\n============================`)
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

    // Zufällige Nachrichten, wenn -z gegeben ist.
    for(let i = 0; i < random_blocks; i++) {
        const people: Array<string> = ["Mondei1", "GoodbyeDarkness", "youngLarry", "thatminer", "Ray", "Eisenfell", "locumat", "Mori", "DerTim", "fck_cDu", "stanley", "theNarrator"];
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
            "Zufällig habe ich eine Nachricht geschrieben und zufällig an dich gesendet.",
            "Vielleicht gewinne per Zufall im Lotto."
        ]
        const from: string = people[random(0, people.length-1).toFixed(0)];
        const to: string = people[random(0, people.length-1).toFixed(0)];
        const message: string = messages[random(0, messages.length-1).toFixed(0)];
        await blockchain.addBlock(from, to, message);
    }

    // Manipuliert bestimmte Blöcke
    if(manipulate_blocks.length > 0) {
        for(let i = 0; i < manipulate_blocks.length; i++) {
            if(manipulate_blocks[i] != -1) {
                try {
                    const currentBlock = blockchain.chain[manipulate_blocks[i]];
                    const action = random(0, 2).toFixed(0);
                    switch(action) {
                        // Ändere Hash des Blockes
                        case '0':
                            currentBlock.hash = await sha256(random(1, 99999).toString()); // Erstellt einen zufälligen Hash
                            break;
                        // Ändere Nachricht
                        case '1':
                            currentBlock.message = "Die Nachricht wurde manipuliert.";
                            break;
                        // Ändere previous_hash
                        case '2':
                            currentBlock.previous_hash = await sha256(random(1, 99999).toString()); // Erstellt einen zufälligen Hash
                            break;
                    }
                    console.log("Block " + currentBlock.index + " manipuliert.")
                } catch(err) {
                    console.log(chalk.red(`Block #${manipulate_blocks[i]} wurde nicht gefunden!`));
                }    
            }
        }
    }

    // Zeigt die Blockchain an, wenn --noshow nicht gegeben ist.
    if(!hide_blockchain) {
        console.log(blockchain.chain);
    }

    // Führt überprüfung durch, wenn --novalid nicht gegeben ist.
    if(!no_validation) {
        console.log("\n\n\n");

        // Validiert die Blockchain und entfernt Duplikate
        const blockchainValidation: Array<Block> = (await blockchain.validate()).filter(function(elem, index, self) {
            return index === self.indexOf(elem);
        });

        if(blockchainValidation.length == 0) {
            console.log(chalk.bold(chalk.green("Blockchain ist komplett valide!")));
        } else {
            console.log(chalk.bold(chalk.red(`Blockchain hat ${blockchainValidation.length} fehlerhafte Blöcke:`)));
            blockchainValidation.forEach((block) => {
                console.log(`  - Block #${block.index}`)
            })
        }
    }
    const finishTime = Date.now();
    console.log(`Laufzeit: ${((finishTime-startTime)/1000).toFixed(2)}s`)
}

// ------------------------- [ANDERE FUNKTIONEN] -------------------------
/**
 * Erstellt eine zufällige Zahl zwischen `min` und `max`
 */
function random(min, max): number {
    return Math.random() * (max - min) + min;
}

/**
 * Diese Funktion errechnet den Hash eines Blockes (SHA-256)
 */
async function sha256(toHash: string): Promise<string> {
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

run();