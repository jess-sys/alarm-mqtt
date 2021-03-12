const chalk = require('chalk')
const events = require('events')
let activePlayers = []

const soundEvent = new events.EventEmitter()

soundEvent.on('newAlarmMessage', (alarmObject) => {
    if (alarmObject.status === 'cleared') {
        soundEvent.emit('stopAllSounds')
    }
    if (alarmObject.status === 'ongoing') {
        console.log(`${chalk.bgYellow('[ALARM]')} ${chalk.bgYellow(chalk.underline(alarmObject.topic + ' : ALARM TRIGGERED'))}`)
        soundEvent.emit('startSound', alarmObject.is_loop, alarmObject.sounds)
    }
})

soundEvent.on('startSound', (isLoop, sounds) => {
    try {
        const player = require('play-sound')(opts = {
            'player': 'mpg123'
        })
        if (sounds.voice !== null) {
            player.play(sounds.voice, function(err){
                if (err) throw err
            })
        }
        if (isLoop) {
            let lPlayer = setInterval(() => {
                player.play(sounds.sound, function(err){
                    if (err) throw err
                })
            }, 3000)
            activePlayers.push(lPlayer)
        } else {
            player.play(sounds.sound, function(err){
                if (err) throw err
            })
        }
    } catch (e) {
        console.info(`[${chalk.red('SOUND')}] Issue with audio library ${e}`)
    }
})

soundEvent.on('stopAllSounds', () => {
    for (let lPlayer in activePlayers) {
        clearInterval(lPlayer)
    }
})

exports.event = soundEvent