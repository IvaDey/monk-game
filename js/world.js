(function () {
    // ------------------------------------------------------------------------------------------------------------
    // Базовые настройки мира
    // ------------------------------------------------------------------------------------------------------------
    let objectsList = []
    let gravity = 10
    let timerId = null
    let animationId = null

    let lastTime = 0
    let dt = 0
    let timeKof = 100

    let bg = null

    // Информация об игровой карте
    // let map = {
    //     objects: [],
    //     mapOffset: {
    //         x: 0,
    //         y: 0
    //     },
    //     mapWidth: 0,
    //     mapHeight: 0
    // }
    let mapOffset = 0

    // Прокрутка карты
    let moveMap = function () {
        if (player.x - mapOffset > gameField.width / 2 - player.width / 2 && mapOffset < mapWidth - gameField.width) {
            ctx.translate(mapOffset, 0)
            mapOffset = Math.round(player.x - gameField.width / 2 + player.width / 2)
            ctx.translate(-mapOffset, 0)

            leftWall.x = mapOffset - leftWall.width
            leftWall.hitbox.left = leftWall.x
            leftWall.hitbox.right = leftWall.x + leftWall.width
        } else if (mapOffset > mapWidth - gameField.width) {
            ctx.translate(mapOffset, 0)
            mapOffset = mapWidth - gameField.width
            ctx.translate(-mapOffset, 0)
        }
    }

    let updatePosition = function (unit) {
        // Вычисляем перемещение объекта
        // Определяем ускорения
        let horA = unit.forces.acceleration.left + unit.forces.acceleration.right     // Горизонтальное ускорение
        let verA = unit.forces.acceleration.up + unit.forces.acceleration.down        // Вертикальное ускорение

        let moving = {
            x: Math.round(unit.forces.speed.horizontal * dt + horA * dt * dt / 2),       // Горизонтальное смщение
            y: Math.round(unit.forces.speed.vertical * dt + verA * dt * dt / 2)          // Вертикальное смещение
        }

        let needToFall = true

        objectsList.forEach(function (obj) {
            // Если наткнулись на обновляемый объект, то пропускаем итерацию
            if (obj == unit)
                return

            // Если объект за пределами карты, то проверять его тоже не стоит
            // if (obj.x < mapOffset || obj.y < 0 || obj.x > mapOffset + 500 || obj.y > 700)
            //     return

            let col = player.predictCollision(obj, dt)

            if (col) {
                if (col.top !== null) {
                    moving.y += col.top + 1

                    unit.forces.speed.vertical = 0
                }

                if (col.right !== null) {
                    moving.x -= col.right + 1
                }

                if (col.bottom !== null) {
                    moving.y -= col.bottom + 1

                    unit.forces.acceleration.up = -gravity
                    verA = 0
                    unit.forces.speed.vertical = 0
                }

                if (col.left !== null) {
                    moving.x += col.left + 1
                }
            }

            // Проверяем надо ли падать
            // Если по итогу объект на расстоянии 1 от объекта, то не надо
            let a = !(unit.hitbox.left > obj.hitbox.right || unit.hitbox.right < obj.hitbox.left)
            if (a && Math.abs(unit.hitbox.bottom - obj.hitbox.top) <= 1) {
                needToFall = false
            }
        })

        if (needToFall) {
            unit.forces.acceleration.up = 0
            verA = 10
        }

        // Обновляем скорости
        unit.forces.speed.horizontal += horA * dt
        unit.forces.speed.vertical += verA * dt

        // Обновляем позицию
        unit.x += moving.x
        unit.y += moving.y
    }

    let updateWorld = function () {
        dt = (Date.now() - lastTime) / timeKof
        lastTime = Date.now()

        if (bg)
            ctx.drawImage(resources.sprites.bgImage, mapOffset, 0, gameField.width, gameField.height)
        else ctx.clearRect(mapOffset, 0, gameField.width, gameField.height)

        objectsList.forEach(function (obj) {
            if (obj.type == 'player')
                updatePosition(obj)

            obj.updateFrame()
            obj.render()
        })

        moveMap()

        animationId = requestAnimationFrame(updateWorld)
    }

    let turnOn = function (ctx) {
        lastTime = Date.now()

        objectsList.forEach(function (obj) {
            if (obj.type == 'player') {
                player = obj        // Костыль
                obj.forces.acceleration.down = gravity
            }
        })

        animationId = requestAnimationFrame(updateWorld)
    }

    let turnOff = function () {
        cancelAnimationFrame(animationId)
    }

    // Добавление нового оюъекта в мир
    let addNewObject = function (newObj) {
        objectsList.push(newObj)

        if (newObj.type == 'player')
            newObj.forces.acceleration.down = gravity
    }

    // Добавление заднего фона
    let addBackground = function (bgImage) {
        bg = bgImage
    }

    window.world = {
        run: turnOn,
        stop: turnOff,
        addNewObject: addNewObject,
        addBackground: addBackground
    }
})()