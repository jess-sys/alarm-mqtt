const events = require('events')
const chalk = require('chalk');
const fs = require('fs');
const mqttHandler = require('./mqttHandler')

const configEvent = new events.EventEmitter()
let config = {}
let backup_config = {}

configEvent.on('configChange', () => {
    fs.readFile('./config.json', 'utf8', (err, content) => {
        try {
            backup_config = config
            config = JSON.parse(content)
            console.info(`[${chalk.yellow('CORE')}] Configuration file loaded`)
            mqttHandler.updateSubscriptions(config, backup_config)
        } catch (e) {
            console.info(`[${chalk.red('CORE')}] Cannot parse configuration file`)
        }
    })
})

configEvent.on('start', (content) => {
    configEvent.emit('configChange')
})

fs.watchFile('./config.json', (curr, prev) => {
    configEvent.emit('configChange')
});

configEvent.emit('start')

/*let player = require('play-sound')(opts = {
    'player': 'mpg123'
})
player.play('./assets/burglar.mp3', function(err){
    if (err) throw err
})*/