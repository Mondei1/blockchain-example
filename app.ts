import * as crypto from 'crypto';
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
     * Diese Funktion errechnet den Hash eines Blockes.
     */
    async calculateHash(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                const startTime = new Date().getTime();
                console.log("Rechen mit", this.mergeData())
                // Schleife die nur endet, wenn der Hash mit drei Nullen anfängt. (difficulty)
                while(!this.hash.startsWith(this.blockchain.getHashStart())) {
                    let hash = crypto.createHash('sha256');
                    hash.update(this.mergeData(), 'utf8');
                    this.hash = hash.digest('hex');
                    this.nonce++;
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
    private mergeData() {
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

        console.log(`Generierte Block #${newBlock.index}: ${newBlock.hash} (innerhalb von ${newBlock.calcTime}ms)`);
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

    async validate(): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
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
                        resolve(false);
                    }
                }
    
                // Überprüfe ob der eigene Hash stimmt
                // Startet der Hash mit x Nullen?
                if(block.hash.startsWith(this.getHashStart())) {
                    // Stimmt der Hash allgemein?
                    const blockHash = JSON.parse(JSON.stringify(block.hash));
                    const newHash = await block.calculateHash();
                    if(newHash == blockHash) {
                        console.log(chalk.green("\t-> Hash ist korrekt (" + blockHash + " == " + newHash + ")"))
                    } else {
                        console.log(chalk.red("\t-> !! Hash ist falsch !!"))
                        resolve(false);
                    }
                } else {
                    console.log(chalk.red(`\t-> !! Hash startet nicht mit ${this.difficulty} Nullen !!`))
                    resolve(false);
                }
            }
            console.log(chalk.bold(chalk.green("Blockchain ist komplett valide!")));
            resolve(true);
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
    // Ein paar Benutzer
    enum USERS {
        USER1 = "Mondei1",
        USER2 = "GoodbyeDarknes",
        USER3 = "youngLarry"
    }
    const blockchain: Chain = new Chain(2);
    
    console.log("Erstelle Blöcke ...\n============================")
    await blockchain.generateGenesisBlock();  // Erstelle Genesis Block (setup)

    // Konversation 1
    await blockchain.addBlock(USERS.USER1, USERS.USER2, "Hey, wie geht es dir? Der Urlaub ist wohl bald rum?");
    await blockchain.addBlock(USERS.USER2, USERS.USER1, "Mir geht es super, danke der Nachfrage! Freue mich aber wieder bald zuhause zu sein." +
    "Aber bitte erinnere mich nicht daran das in zwei Tagen wieder Schule ist D:");
    await blockchain.addBlock(USERS.USER1, USERS.USER2, "Tchja, in zwei Tagen ist wieder Schule (:\nWar der Urlaub wirklich so schlimm?");
    await blockchain.addBlock(USERS.USER1, USERS.USER2, "Hattest du im Urlaub Zeit diese eine Hausaufgabe für Mathe zu machen?")

    // Konversation 2
    await blockchain.addBlock(USERS.USER3, USERS.USER1, "Sag mal, kannst du mir mal die Hausaufgaben von gestern schicken. Bin zu faul die jetzt zu machen ¯\\_(ツ)_/¯");
    await blockchain.addBlock(USERS.USER1, USERS.USER3, "Hab die selber nicht. Leider ist unser alleswisser " + USERS.USER2 + " noch im Urlaub, habe ihn aber gerade gefragt aber ich hab noch keine Antwort.")

    blockchain.chain[2].message = "aab4224";
    console.log(blockchain.chain);
    console.log("\n\n\n");

    blockchain.validate();
}

run();