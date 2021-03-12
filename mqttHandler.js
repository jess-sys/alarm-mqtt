const chalk = require('chalk')

const soundPlayer = require('./soundPlayer')

function updateSubscriptions(client, config, backup) {
    let topics = []
    let topics_backup = []

    for (let topic in config['topics'])
        topics.push(config['prefix'] + topic)
    for (let topic in backup['topics'])
        topics_backup.push(backup['prefix'] + topic)

    if (topics_backup.length !== 0) {
        for (let topic in topics_backup) {
            let nTopic = topics_backup[topic]
            if (!topics.includes(nTopic)) {
                try {
                    client.unsubscribe(nTopic)
                    console.log(`[${chalk.yellow('MQTT')}] Unsubscribing from ${chalk.underline(nTopic)}`)
                } catch (e) {
                    console.log(`[${chalk.red('MQTT')}] Unable to unsubscribing from ${chalk.underline(nTopic)}`)
                }
            }
        }
    }
    for (let topic in topics) {
        let nTopic = topics[topic]
        if (!topics_backup.includes(nTopic)) {
            try {
                client.subscribe(nTopic)
                console.log(`[${chalk.green('MQTT')}] Subscribing to ${chalk.underline(nTopic)}`)
            } catch (e) {
                console.log(`[${chalk.red('MQTT')}] Unable to subscribe to ${chalk.underline(nTopic)}`)
            }
        }
    }
}

function onMessage(topic, message) {
    let alarmObject = {
        "is_loop": false,
        "topic": topic,
        "severity": "classic",
        "status": "cleared",
        "sounds": {}
    }
    try {
        topic = topic.slice(global.config.prefix.length)
        if (!Object.keys(global.config['topics']).includes(topic)) {
            console.log(`[${chalk.yellow('ALARM')}] ${chalk.underline(topic)} : Received poorly formatted alarm message, ignoring`)
            return
        }
        message = JSON.parse(message)
        if (message.hasOwnProperty('severity') && message.hasOwnProperty('status')) {
            alarmObject.severity = ['classic', 'moderate', 'high', 'critical'].includes(message.severity) ? message.severity : 'classic'
            alarmObject.status = ['ongoing', 'cleared'].includes(message.status) ? message.status : 'cleared'
            alarmObject.is_loop = topic.includes('long/')
            alarmObject.sounds = global.config['topics'][topic][alarmObject.severity]
            soundPlayer.event.emit('newAlarmMessage', alarmObject)
            console.log(`[${chalk.blue('ALARM')}] ${chalk.underline(topic)} : Received valid alarm message (${alarmObject.status})`)
        } else {
            console.log(`[${chalk.yellow('ALARM')}] ${chalk.underline(topic)} : Received poorly formatted alarm message, ignoring`)
        }
    } catch (e) {
        console.log(`[${chalk.magenta('ALARM')}] ${chalk.underline(topic)} : Received poorly formatted alarm message, ignoring`)
        console.log(e)
    }
}

exports.updateSubscriptions = updateSubscriptions
exports.onMessage = onMessage
