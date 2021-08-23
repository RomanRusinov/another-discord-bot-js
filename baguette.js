const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./bruh/config.json')
const ytdl = require('ytdl-core');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const fs = require('fs')
const express = require('express')
const {spawn} = require('child_process');
const app = express()
const port = 3000

client.login(config.token);

client.once('ready', () => {
    console.log('Logged on as ' + client.user.tag)
    client.user.setActivity("$help", {
      type: 'LISTENING',
      name: '$help',
      url: "https://shlyapa-inc.herokuapp.com/bot"
    });
})

var loop = false

let queue = []

client.on('message', async message => {
  if (!message.guild) return;

  if (message.content === config.prefix + 'join') {
    if (message.member.voice.channel) {
      const connection = await message.member.voice.channel.join();
    } else {
      message.reply('You need to join a voice channel first!');
    }
  }


  else if (message.content.startsWith('$play')){
    if (message.member.voice.channel) {
      const connection = await message.member.voice.channel.join();
      let msg = message.content.split(' ').slice(1).join(' ')
      console.log(msg)
      if (msg.split(' ').length === 1 && msg.startsWith('https://')) {
        queue.push(msg)
        console.log(queue)
        if (queue.length === 1){
          const dispatcher = connection.play(ytdl(queue[0], { filter: 'audioonly' }));
        }
        else{
          queue.push(msg)
          queue.shift()
          message.channel.send(`Added ${(await ytdl.getInfo(message.content.split(' ').slice(1).join(' '))).videoDetails['title']} to queue`)
        }
        let image = `https://i.ytimg.com/vi/${(await ytdl.getInfo(message.content.split(' ').slice(1).join(' '))).videoDetails['videoId']}/hqdefault.jpg`
        const embed = new Discord.MessageEmbed()
          .setTitle((await ytdl.getInfo(message.content.split(' ').slice(1).join(' '))).videoDetails['title'])
          .setURL(msg)
          .setAuthor(message.author.username)
          .setColor(0xff0000)
          .addField('Video duration', value=`${(await ytdl.getInfo(message.content.split(' ').slice(1).join(' '))).videoDetails['lengthSeconds']} seconds`)
          .setThumbnail(image)
        message.channel.send(embed)
        try{
          dispatcher.on('start', () => {
          	console.log('audio.mp3 is now playing!');
          });

          dispatcher.on('finish', () => {
            if (loop === false){
              queue.shift()
            }
            else if (loop === true){
              play(ytdl(queue[0], { filter: 'audioonly' }), connection)
              function play(stream, conn){
                const dispatcher = conn.play(ytdl(queue[0], { filter: 'audioonly' }));
                dispatcher.on('finish', () => {
                  if (loop === true){
                    play(stream, conn)
                  }
                })
              }
            }
            if (queue.length > 1){
              console.log(queue.length)
              queue.shift()
              console.log('Playing next')
              play(ytdl(queue[0], { filter: 'audioonly' }), connection)
              function play(stream, conn){
                const dispatcher = conn.play(ytdl(queue[0], { filter: 'audioonly' }));
                dispatcher.on('finish', () => {
                  if (queue.length > 1){
                    queue.shift()
                    console.log(queue)
                    play(stream, conn)
                  }
                })
              }
            }
          });

          dispatcher.on('error', console.error);
        } catch{
          return
        }
    }
      else {
        let msg = message.content.split(' ').slice(1).join(' ')
        let url = `https://www.google.com/search?q=${msg}&client=opera-gx&hs=GAJ&source=lnms&tbm=vid&sa=X&ved=2ahUKEwiwz5He8NjxAhXnmIsKHQeQD3AQ_AUoAXoECAEQAw&biw=1879&bih=970`
        let urlEnc = encodeURI(url)
      //   function httpGet(theUrl) {
      //     var xmlHttp = new XMLHttpRequest();
      //     xmlHttp.open("GET", theUrl, false); // false for synchronous request
      //     xmlHttp.send(null);
      //     return xmlHttp.responseText;
      // }
      fs.writeFile(`${__dirname}\/bruh\/bruh.txt`, urlEnc, function (err) {
        if (err) return console.log(err);
        let msg = message.content.split(' ').slice(1).join(' ')
        message.channel.send(`Searching for ${msg} on YouTube`)
      });

      const python = spawn('python', ['bruh/parser.py']);

      python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        dataToSend = data.toString();
      });

      python.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`)
      });

      python.on('close', (code) => {

      try {
        var data = fs.readFileSync(`${__dirname}\/bruh\/bruhbruh.txt`, 'utf8');
        console.log(data.toString())
        queue.push(data.toString())
        console.log(queue)
        if (queue.length === 1){
          const dispatcher = connection.play(ytdl(queue[0], { filter: 'audioonly' }));
          fs.truncate(`${__dirname}\/bruh\/bruhbruh.txt`, 0, function(){console.log('done')})
        }
        else{
          queue.push(data.toString())
          queue.shift()
          // message.channel.send(`Added ${ytdl.getInfo(data.toString()).videoDetails['title']} to queue`)
        }
        // let image = `https://i.ytimg.com/vi/${data.toString()}/hqdefault.jpg`
        // const embed = new Discord.MessageEmbed()
        //   .setTitle(ytdl.getInfo(data.toString()).videoDetails['title'])
        //   .setURL(data.toString())
        //   .setAuthor(message.author.username)
        //   .setColor(0xff0000)
        //   .addField('Video duration', value=`${(ytdl.getInfo(data.toString()).videoDetails['lengthSeconds'])} seconds`)
        //   .setThumbnail(image);
        // message.channel.send(embed)
      } catch(e) {
        console.log('Error:', e.stack);
        } 
      try{
        dispatcher.on('start', () => {
          console.log('audio.mp3 is now playing!');
        });
        dispatcher.on('finish', () => {
          var audio = queue[0]
          fs.truncate(`${__dirname}\/bruh\/bruhbruh.txt`, 0, function(){console.log('done')})
          if (loop === false){
            queue.shift()
          }
          else if (loop === true){
            play(ytdl(audio, { filter: 'audioonly' }), connection)
            function play(stream, conn){
              const dispatcher = conn.play(ytdl(queue[0], { filter: 'audioonly' }));
              fs.truncate(`${__dirname}\/bruh\/bruhbruh.txt`, 0, function(){console.log('done')})
              dispatcher.on('finish', () => {
                if (loop === true){
                  play(stream, conn)
                }
              })
            }
          }
          if (queue.length > 1){
            console.log(queue.length)
            queue.shift()
            console.log('Playing next')
            play(ytdl(queue[0], { filter: 'audioonly' }), connection)
            function play(stream, conn){
              const dispatcher = conn.play(ytdl(queue[0], { filter: 'audioonly' }));
              fs.truncate(`${__dirname}\/bruh\/bruhbruh.txt`, 0, function(){console.log('done')})
              dispatcher.on('finish', () => {
                if (queue.length > 1){
                  queue.shift()
                  console.log(queue)
                  play(stream, conn)
                }
              })
            }
          }
          else{
            fs.truncate(`${__dirname}\/bruh\/bruhbruh.txt`, 0, function(){console.log('done')})
          }
        });
        dispatcher.on('error', console.error);
      } catch{
        console.log('finish error')
        queue.shift()
      }
      });
    }
  }
}


  else if (message.content === config.prefix + 'skip'){
    loop = false
    try{
      fs.truncate(`${__dirname}\/bruh\/bruhbruh.txt`, 0, function(){console.log('done')})

    } catch{
      return
    }
    try{
      connection = await message.member.voice.channel.join();
    } catch{
      message.channel.send('You need to join a voice channel first!')
    }
    try{
      if (message.member.voice.channel){
        queue.shift()
        connection.dispatcher.end();
        if (queue.length > 0){
          play(ytdl(queue[0], { filter: 'audioonly' }), connection)
          function play(stream, conn){
            const dispatcher = conn.play(ytdl(queue[0], { filter: 'audioonly' }));
            fs.truncate(`${__dirname}\/bruh\/bruhbruh.txt`, 0, function(){console.log('done')})
            dispatcher.on('finish', () => {
              if (queue.length > 1){
                queue.shift()
                console.log(queue)
                play(stream, conn)
              }
            })
          }
        }
      } else {
        message.channel.send('You need to join a voice channel first!')
      }
    } catch {
      return
    }
  }


  else if (message.content === config.prefix + 'pause'){
    try{
      connection = await message.member.voice.channel.join();
    } catch{
      message.channel.send('You need to join a voice channel first!')
    }
    try{
      if (message.member.voice.channel){
        connection.dispatcher.pause();
      }
    } catch {
      message.channel.send('There are nothing to pause')
    }
  }


  else if (message.content === config.prefix + 'resume'){
    try{
      connection = await message.member.voice.channel.join();
      connection.dispatcher.resume();
  } catch {
    console.log('bruh')
  }
}


  else if (message.content === config.prefix + 'secret'){
    const connection = await message.member.voice.channel.join();
    const dispatcher = connection.playFile(`${__dirname}\/bruh\/https___psv4.userapi.com_c205420__u350291456_audiomsg_d18_ca00a59c53_1.mp3`);
  }


  else if (message.content === config.prefix + 'leave'){
    try{
      message.member.voice.channel.leave()
      queue = []
    } catch{
      message.channel.send('Bot is not in a voice')
    }
  }


  else if (message.content === config.prefix + 'loop'){
    loop = !loop
    if (loop === true){
      message.channel.send('Loop is enabled')
    }
    else{
      message.channel.send('Loop is disabled')
    }
    console.log(loop)
  }


  else if (message.content === config.prefix + 'korol'){
    if (message.author.id === '429218481553145859'){
      message.member.voice.setChannel(client.channels.cache.get('794960096312033320'))
    }
  }


  else if (message.content === config.prefix + 'help'){
    const embed = new Discord.MessageEmbed()
      .setTitle('List of commands')
      // .setAuthor(message.author.username)
      .setColor(0xff0000)
      .addField('Префикс', value='$', inline=false)
      .addField('Список комманд', value='play - воспроизведение аудио с YouTube по URL/названию видео\nloop - зацикливает воспроизведение аудио\njoin - бот присоединяется к голосовому каналу\nleave - бот выходит из голосового канала\nskip - прекращение воспроизведения аудио\npause - приостонавливает воспроизведение аудио\nresume - восстанавливает воспроизведение аудио', inline=false)
      .addField('Другие функции', value='Бот создаёт временный открытый голосовой канал, когда пользователь заходит в канал "Создать канал🔓"')
    message.channel.send(embed)
  }


});

client.on('voiceStateUpdate', (oldChannel, newChannel) => {
  try{
    if (newChannel.channel === client.channels.cache.get('796800584275591220')){
      const createdChannel = newChannel.guild.channels.create(`Комната ${newChannel.member.displayName}`, {type: 'voice', parent: '796800504923029514'})
        .then((channel) => {
          newChannel.setChannel(channel)
      });
    }
    else if (oldChannel.channel.parentID === '796800504923029514'){
      if (oldChannel.channel === client.channels.cache.get('796800584275591220')){
      }
      else{
        if (oldChannel.channel.members.size === 0){
          oldChannel.guild.channels.cache.get(`${oldChannel.channelID}`).delete()
        }
      }
    }
  } catch{
    console.log('Error')
  }
});
