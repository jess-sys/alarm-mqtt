let mqtt = require('mqtt')
const chalk = require('chalk');

let client = mqtt.connect('mqtt://' + process.env.MQTT_BROKER)

function updateSubscriptions(config, backup) {
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

exports.updateSubscriptions = updateSubscriptions
