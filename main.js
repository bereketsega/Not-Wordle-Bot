require("dotenv").config();
const fs = require("fs");
const Discord = require("discord.js");

const TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = "."; // bot will use . command

const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MESSAGES"],
});

client.on("ready", () => {
    console.log("Bot Ready!");
});

let theWord = " "; // to store the actual word
let allWords = []; // to store potential words

commandCounts = { guess: 0 }; // to store the number of guesses

client.on("messageCreate", (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const commandBody = message.content.slice(PREFIX.length);
    let args = commandBody.split(" ");
    const command = args.shift().toLowerCase();
    args = args[0]; // guessed word

    // help command
    if (command === "h") {
        message.reply(
            ".s - to start playing\n" +
                ".g <word> - to guess the word\n" +
                ".h - for information\n" +
                "            How To Play    \n" +
                "At .s command a random five letter word will be generated.\n" +
                "You try to guess (.g <word>) the word in 6 tries.\n" +
                "🟩 - indicates the letter appears in the correct position.\n" +
                "🟨 - indicates the letter appears but in the wrong position.\n" +
                "⬜ - indicates the letter does not exist in the word.\n"
        );
    }
    // start command
    else if (command === "s") {
        try {
            // get a word
            const data = fs.readFileSync("words.txt", "utf8");
            allWords = data.split("\n");
            theWord = allWords[Math.floor(Math.random() * allWords.length)];
        } catch (err) {
            console.error(err);
        }
        message.reply("Guess the 5 letter word.");
    }
    // guess command
    else if (command === "g") {
        // case: word has not been generated
        if (theWord === " ") {
            message.reply("You need to .s to start");
            return;
        }
        // case: guess is not 5 letter
        if (args.length != 5) {
            message.reply("Your guess is not a 5 letter word");
            return;
        }
        // case: guess is not a word
        wordExist = false;
        for (word in allWords) {
            if (allWords[word] == args) {
                wordExist = true;
                break;
            }
        }
        if (wordExist == false) {
            message.reply("Your guess is not in the list.");
            return;
        }

        commandCounts["guess"] = commandCounts["guess"] + 1; // count attempts

        // check attempts
        if (commandCounts["guess"] <= 6) {
            // case: right guess, feedback and reset
            if (args === theWord) {
                message.reply("🟩🟩🟩🟩🟩");
                commandCounts["guess"] = 0;
                theWord = " ";
                return;
            }

            // case: some letter not in right position
            // check each letter and give indication
            else {
                let res = ""; // to build feedback string

                for (let i = 0; i < theWord.length; i++) {
                    // case: letter in right position
                    if (theWord[i] == args[i]) {
                        res += "🟩";
                    }

                    //case: letter in wrong position or DNE
                    else {
                        // count appearance of a letter
                        let appear = theWord.split(args[i]).length - 1;
                        let guessAppear = args.split(args[i]).length - 1;
                        //case: letter appears but in wrong position
                        if (appear == guessAppear) res += "🟨";
                        //case: letter appears more than expected
                        else if (guessAppear > appear) {
                            res += "⬜";
                            args = args.substr(0, i) + " " + args.substr(i + 1); // eliminate the letter
                        }

                        //case: letter appears at least
                        else if (guessAppear < appear && guessAppear > 0)
                            res += "🟨";
                        // case: letter DNE
                        else if (appear == 0) res += "⬜";
                    }
                }
                message.reply(res); //respond with feedback
            }
        }

        //case: attempt limit exceeded, respond with indication and reset
        if (commandCounts["guess"] >= 6) {
            message.reply("Sorry, the word was: " + theWord);
            commandCounts["guess"] = 0;
            theWord = " ";
        }
    }
});

client.login(TOKEN);
