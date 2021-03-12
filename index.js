const events = require('events')
const chalk = require('chalk')
let mqtt = require('mqtt')
const fs = require('fs')

const mqttHandler = require('./mqttHandler')

const configEvent = new events.EventEmitter()
let config = {}
let backup_config = {}

global.config = config

configEvent.on('configChange', () => {
    fs.readFile('./config.json', 'utf8', (err, content) => {
        try {
            backup_config = config
            config = JSON.parse(content)
            global.config = config
            console.info(`[${chalk.green('CORE')}] Configuration file loaded`)
            mqttHandler.updateSubscriptions(client, config, backup_config)
        } catch (e) {
            console.info(`[${chalk.red('CORE')}] Cannot parse configuration file`)
        }
    })
})

configEvent.on('start', (client) => {
    configEvent.emit('configChange', client)
})

fs.watchFile('./config.json', (curr, prev) => {
    configEvent.emit('configChange', client)
});

let client = mqtt.connect('mqtt://' + process.env.MQTT_BROKER)

client.on('connect', function () {
    console.info(`[${chalk.green('MQTT')}] Connected to mqtt://${chalk.underline(process.env.MQTT_BROKER)}`)
    configEvent.emit('start', client)
})

client.on('message', mqttHandler.onMessage)