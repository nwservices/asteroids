
const rotationCorrection = require('./rotationCorrection')
const ship = require('./ship')()
console.log(ship)

window.onload = function() {

  const width = 400,
        height = 400

  const game = new Phaser.Game(width, height, Phaser.AUTO, 'phaser', { preload: preload, create: create, update: update })

  let player
  let cursors
  let projectiles
  let fireDelay = 30
  let asteroids
  let numberOfAsteroids = 4
  let playerLaser
  let explosion
  let subAsteroids =['asteroid3', 'asteroid2']
  let winText

  // Constants
  const piForRad = Math.PI/180
  // Functors
  const degToRad = degree => degree * piForRad

  function preload () {
    game.load.image('bigShip', 'bigShip.png')
    game.load.image('asteroid1', 'asteroid1.png')
    game.load.image('asteroid2', 'asteroid2.png')
    game.load.image('asteroid3', 'asteroid3.png')
    game.load.audio('playerLaser', 'laser.wav');
    game.load.audio('explosion', 'explosion.wav');
    game.load.audio('engine', 'engine.wav');
  }
  
  function create () {

    // projectiles
    projectiles = game.add.group()
    projectiles.enableBody = true
    // player
    player = game.add.sprite(game.width/2 - 2, game.height/2 - 2, 'bigShip')
    game.physics.arcade.enable(player)
    player.pivot.x = 12.5
    player.pivot.y = 12.5
    
    // cursors
    cursors = game.input.keyboard.createCursorKeys()
    cursors.fire = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)

    // asteroid(s)
    asteroids = game.add.group()
    // asteroid = game.add.sprite(40, 40, 'asteroid1')
    // game.physics.arcade.enable(asteroid)
    // asteroid.body.velocity.x = 15
    // asteroid.body.velocity.y =22
    spawnAsteroids()

    // sounds
    laser = game.add.audio('playerLaser', 0.1)
    explosion = game.add.audio('explosion', 0.1)
    engine = game.add.audio('engine', 0.1)
  }

  function update () {
    game.physics.arcade.overlap(projectiles, asteroids, shootAsteroid, null, this)
    game.physics.arcade.overlap(player, asteroids, smashPlayer)
    fireDelay += 1

    // movement
    if(cursors.left.isDown) {
      player.rotation -= 0.05
    }
    if(cursors.right.isDown) {
      player.rotation += 0.05
    }
    if(cursors.up.isDown) {
      const vector = ship.thrustVector(rotationCorrection(player.angle))
      player.body.velocity.x += vector.x
      player.body.velocity.y += vector.y
    }
    // wrap warp
    wrapWarp(player)

    for(let i = 0; i< asteroids.children.length; i++) {
      wrapWarp(asteroids.children[i])
    }
    // shooting
    if(cursors.fire.isDown && fireDelay >= 30) {
      const fire = ship.fire(rotationCorrection(player.angle))
      let projectile = game.add.graphics(player.left + fire.left, player.top + fire.top)
      projectile.beginFill(0xFFFFFF, 1)
      projectile.drawRect(0,0,3,3)
      projectile.endFill()
      game.physics.arcade.enable(projectile)
      projectiles.addChild(projectile)
      projectile.body.velocity.x += fire.x
      projectile.body.velocity.y += fire.y
      laser.play()
      fireDelay = 0
    }
  }

  function spawnAsteroids() {
    for (let i = 0; i < numberOfAsteroids; i++) {
      let position = {x: game.width * Math.random(), y: game.height * Math.random()}
      let asteroid = asteroids.create(position.x, position.y, 'asteroid1')
      game.physics.arcade.enable(asteroid)
      asteroid.body.velocity.x = 20 * (Math.random() - 0.5)
      asteroid.body.velocity.y = 20 * (Math.random() - 0.5)
      asteroid.size = 2
    }
  }
  function shootAsteroid(projectile, asteroid) {
    explosion.play()
    splitAsteroids(projectile, asteroid)
    projectile.kill()
  }
  function splitAsteroids(projectile, asteroid){
    if (asteroid.size > 0) {
      for (let i = 0; i < 2; i++) {
        let offset = {x: 20 * Math.random(), y: 20 * Math.random()}
        let spliteroid = asteroids.create(asteroid.centerX + offset.x, asteroid.centerY + offset.y, subAsteroids[asteroid.size - 1])
        game.physics.arcade.enable(spliteroid)
        spliteroid.body.velocity.x = asteroid.body.velocity.x + (projectile.body.velocity.x) / 10
        spliteroid.body.velocity.y = asteroid.body.velocity.y + (projectile.body.velocity.y) / 10
        spliteroid.size = asteroid.size - 1
      }
    } 
    asteroid.kill()
    console.log(asteroids.countLiving())
    if (asteroids.countLiving() <= 0) {
      winText = game.add.text(game.width/2 - 40, game.height/2, 'You Win!', { fontSize: '32px', fill: '#999' });
      game.paused = true
    }
  }
  function smashPlayer() {
    explosion.play()
    // projectile.kill()
    // asteroid.kil()
  }
  function wrapWarp(target) {
    if(target.left > game.width) {
      target.centerX = 0
    }
    if(target.right < 0) {
      target.centerX = game.width + target.width/2
    }
    if(target.top > game.height) {
      target.centerY = 0
    }
    if(target.bottom < 0) {
      target.centerY = game.height + target.height/2
    }
  }
  function showAsteroid(asteroid) {
    console.log('asteroid')
  }
}
