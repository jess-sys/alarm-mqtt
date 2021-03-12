let player = require('play-sound')(opts = {})

player.play('./assets/burglar.mp3', function(err){
    if (err) throw err
})