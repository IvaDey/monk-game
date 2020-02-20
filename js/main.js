// ----------------------------------------------------------------------------------------------------
//                              Глобальные ресурсы и объекты
// ----------------------------------------------------------------------------------------------------
// Игровое поле
let gameField = document.createElement("canvas")
let ctx = gameField.getContext("2d")
let bgPattern = null
let groundPattern = null
let groundHeight = 96
let baseLine = gameField.height - groundHeight

let player = null
let deathLine = null
let leftWall = null
let rightWall = null

// Игровые объекты
let mapWidth = 5400
let mapOffset = 0

// Карта
let map = []
map.push({ x: 0, y: 1, width: 15, height: 1, type: 'ground' })

map.push({ x: 1, y: 4, width: 1, height: 1, type: 'box' })
map.push({ x: 2, y: 4, width: 1, height: 1, type: 'box' })
map.push({ x: 3, y: 4, width: 1, height: 1, type: 'box' })
map.push({ x: 4, y: 4, width: 1, height: 1, type: 'box' })
// map.push({ x: 2, y: 4, width: .25, height: .25, type: 'box' })

map.push({ x: 6, y: 2, width: 1, height: 1, type: 'box' })

map.push({ x: 8, y: 2, width: 1, height: 1, type: 'box' })
map.push({ x: 9, y: 3, width: 1, height: 1, type: 'box' })
map.push({ x: 9, y: 2, width: 1, height: 1, type: 'box' })

map.push({ x: 10, y: 6, width: 1, height: 1, type: 'box' })

map.push({ x: 10, y: 3, width: 1, height: 2, type: 'pipe' })
map.push({ x: 11, y: 3, width: 1, height: 2, type: 'pipe' })

map.push({ x: 17, y: 1, width: 7, height: 1, type: 'ground' })

map.push({ x: 19, y: 2, width: 1, height: 1, type: 'box' })
map.push({ x: 20, y: 2, width: 1, height: 1, type: 'box' })

map.push({ x: 22, y: 3, width: 1, height: 2, type: 'pipe' })

map.push({ x: 24, y: 5, width: 1, height: 1, type: 'box' })
map.push({ x: 26, y: 5, width: 1, height: 1, type: 'box' })

map.push({ x: 28, y: 3, width: 1, height: 1, type: 'box' })

map.push({ x: 31, y: 5, width: 1, height: 1, type: 'box' })

map.push({ x: 30, y: 3, width: 1, height: 1, type: 'box' })
map.push({ x: 31, y: 3, width: 1, height: 1, type: 'box' })
map.push({ x: 32, y: 3, width: 1, height: 1, type: 'box' })

map.push({ x: 33, y: 5, width: 1, height: 1, type: 'box' })
map.push({ x: 35, y: 5, width: 1, height: 1, type: 'box' })
map.push({ x: 36, y: 5, width: 1, height: 1, type: 'box' })

map.push({ x: 38, y: 5, width: 1, height: 1, type: 'box' })

map.push({ x: 41, y: 2, width: 1, height: 1, type: 'box' })
map.push({ x: 42, y: 2, width: 1, height: 1, type: 'box' })
map.push({ x: 43, y: 2, width: 1, height: 1, type: 'box' })
map.push({ x: 42, y: 3, width: 1, height: 1, type: 'box' })
map.push({ x: 43, y: 3, width: 1, height: 1, type: 'box' })
map.push({ x: 43, y: 4, width: 1, height: 1, type: 'box' })

map.push({ x: 46, y: 2, width: 1, height: 1, type: 'box' })
map.push({ x: 47, y: 2, width: 1, height: 1, type: 'box' })

map.push({ x: 50, y: 1, width: 10, height: 1, type: 'ground' })

map.push({ x: 54, y: 6, width: .5, height: 5, type: 'box' })


// ----------------------------------------------------------------------------------------------------
//                              Вспомогательные функции управления игрой
// ----------------------------------------------------------------------------------------------------
// Задаем размеры игрового поля
let resizeGameField = function () {
    // Получаем текущие размеры окна
    let windowWidth = window.innerWidth
    let windowHeight = window.innerHeight

    // Задаем размеры игрового поля
    gameField.width = windowWidth
    gameField.height = windowHeight

    document.body.width = windowWidth
    document.body.offsetHeight = windowHeight

    baseLine = gameField.height
}

// ----------------------------------------------------------------------------------------------------
//                              Обработчики событий
// ----------------------------------------------------------------------------------------------------
let keyDownHandler = function (e) {
    switch (e.code) {
        case 'ArrowRight':
        case 'KeyD':
            player.goRight()
            break

        case 'ArrowLeft':
        case 'KeyA':
            player.goLeft()
            break

        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
            player.jump()
            break
    }
}

let keyUpHandler = function (e) {
    switch (e.code) {
        case 'ArrowRight':
        case 'KeyD':
            player.stopMoving()
            break

        case 'ArrowLeft':
        case 'KeyA':
            player.stopMoving()
            break
    }
}

// Устанавливаем все необходимые обработчики
let setHandlers = function () {
    document.body.addEventListener('keydown', keyDownHandler)
    document.body.addEventListener('keyup', keyUpHandler)

    // Устанавливаем обработчик на изменение размеров окна
    window.onresize = resizeGameField
}

// ----------------------------------------------------------------------------------------------------
//                              Основные функции управления игрой
// ----------------------------------------------------------------------------------------------------
let reset = function () {
    // Перемещаем игрока на стартовую позицию
    player.x = 50
    player.y = gameField.height - 192

    // Перемещаем левую стену на стартовую позицию
    leftWall.x = -leftWall.width
    leftWall.hitbox.left = leftWall.x
    leftWall.hitbox.right = 0

    // Прокручиваем карту до исходного положения
    ctx.translate(mapOffset, 0)
    mapOffset = 0
}

// ----------------------------------------------------------------------------------------------------
//                              Подготовка к запуску игры
// ----------------------------------------------------------------------------------------------------

// Инициализация и запуск игры
let init = function () {
    // Добавляем canvas на страницу
    resizeGameField()
    document.body.appendChild(gameField)

    // Устанавливаем все необходимые обработчики
    setHandlers()

    // Создаем паттерн заднего фона
    bgPattern = ctx.createPattern(resources.sprites.bgImage, 'repeat')

    // Создаем паттерн земли
    groundPattern = ctx.createPattern(resources.sprites.groundImage, 'repeat')

    // Создаем игрока
    player = new Unit({
        idleLeft: new Sprite(resources.sprites.idleLeft),
        idleRight: new Sprite(resources.sprites.idleRight),
        goRight: new Sprite(resources.sprites.goRight),
        goLeft: new Sprite(resources.sprites.goLeft)
    }, ctx)
    player.x = 50
    player.y = gameField.height - 192

    deathLine = new GameObject(ctx, resources.sprites.waterImage, 0, baseLine - 20,  mapWidth, groundHeight)
    leftWall = new GameObject(ctx, resources.sprites.groundImage, -10, 0,  10, gameField.height)
    rightWall = new GameObject(ctx, resources.sprites.groundImage, mapWidth, 0,  10, gameField.height)

    // Запускаем игру
    world.addNewObject(player)
    world.addNewObject(deathLine)
    world.addNewObject(leftWall)
    world.addNewObject(rightWall)

    map.forEach(function (obj) {
        let spriteImage = resources.sprites[obj.type + 'Image'] ? resources.sprites[obj.type + 'Image'] : '#992800'
        let gmObj = new Box(ctx, spriteImage, obj.x * 96, baseLine - obj.y * 96,  obj.width * 96, obj.height * 96)
        world.addNewObject(gmObj)
    })

    world.addBackground(resources.sprites.bgImage)

    // Запускаем игру
    world.run(ctx)
}

// ----------------------------------------------------------------------------------------------------
//                              Точка входа – полная загрузка страницы
// ----------------------------------------------------------------------------------------------------
// Ждем загрузки страницы, затем грузим ресурсы и затем запускаем игру
document.addEventListener('DOMContentLoaded', function(){
    // Загружаем ресурсы
    resources.onload(init)
    resources.load({
        'sprites': {
            'bgImage': 'resources/patterns/bg.png',
            'groundImage': 'resources/patterns/ground.png',
            'waterImage': 'resources/patterns/water.png',
            'boxImage': 'resources/patterns/box.png',
            'pipeImage': 'resources/patterns/pipe.png',

            'idleLeft': 'resources/sprites/idleLeft.png',
            'idleRight': 'resources/sprites/idleRight.png',
            'goRight': 'resources/sprites/goRight.png',
            'goLeft': 'resources/sprites/goLeft.png'
        }
    })
})