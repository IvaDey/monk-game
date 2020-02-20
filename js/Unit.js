function Unit(unitSprites, ctx) {
    // Основные характеристики персонажа
    // Текущая позиция
    this.x = 0
    this.y = 0

    // Размеры персонажа
    this.width = 64
    this.renderWidth = 96
    this.height = 94
    this.renderHeight = 96

    this.type = 'player'

    this.hitbox = {
        top: this.y,
        right: this.x + this.width,
        bottom: this.y + this.height,
        left: this.x
    }

    // Вектора описывающие направления движения и их силу
    this.forces = {
        speed: {
            horizontal: 0,
            vertical: 0
        },
        acceleration: {
            up: 0,
            right: 0,
            down: 0,
            left: 0
        }
    }

    // Спрайты разных состояний персонажа и информация о текущем состоянии
    this.sprite = unitSprites.idleRight
    this.curPos = 0
    this.state = 'idleRight'
    this.direction = 'right'

    // Статы персонажа
    this.speed = 24            // Скорость юнита
    this.jumpHeight = 72       // Высота / сила прыжка

    // Смерть юнита
    this.die = function () {
        this.renderWidth = 0
        this.renderHeight = 0

        this.x = 0
        this.y = 0
    }

    // ----------------------------------------------------------------------------------------------------
    //                              Команды управления юнитом
    // ----------------------------------------------------------------------------------------------------
    this.jump = function () {
        if (!this.forces.acceleration.up)
            return

        let t = 1       // Для правильного рассчета начальной скорости необходимо учитывать timeKof
        let v = (this.jumpHeight - this.forces.acceleration.down * t * t / 2) / t

        this.forces.speed.vertical = -v
        this.forces.acceleration.up = 0

        // this.state = 'jump'
    }

    this.goLeft = function () {
        this.forces.speed.horizontal = -this.speed

        this.state = 'goLeft'
        this.direction = 'left'
    }

    this.goRight = function () {
        this.forces.speed.horizontal = this.speed

        this.state = 'goRight'
        this.direction = 'right'
    }

    this.goDown = function () {
        this.forces.speed.vertical = 0
        this.forces.acceleration.up = 0
        // this.forces.acceleration.down = 10
    }

    this.stopMoving = function () {
        this.forces.speed.horizontal = 0

        this.state = 'idle'
    }

    // ----------------------------------------------------------------------------------------------------
    //                              Общие методы
    // ----------------------------------------------------------------------------------------------------
    // Проверка на коллизию с другим объектом априорным методом методом
    this.predictCollision = function (gmObj, dt) {
        let col = {
            top: null,
            right: null,
            bottom: null,
            left: null,
            collideWith: gmObj
        }

        // Хитбокс текущего объекта
        let top = this.hitbox.top
        let right = this.hitbox.right
        let bottom = this.hitbox.bottom
        let left = this.hitbox.left

        let horA = this.forces.acceleration.left + this.forces.acceleration.right     // Горизонтальное ускорение
        let verA = this.forces.acceleration.up + this.forces.acceleration.down        // Вертикальное ускорение

        // Горизонтальное и вертикальное смещение объекта
        let horShift = Math.round(this.forces.speed.horizontal * dt + horA * dt * dt / 2)
        let verShift = Math.round(this.forces.speed.vertical * dt + verA * dt * dt /2)

        // Хитбокс объекта, с которым необходимо проверить столкновение
        let gmTop = gmObj.hitbox.top
        let gmRight = gmObj.hitbox.right
        let gmBottom = gmObj.hitbox.bottom
        let gmLeft = gmObj.hitbox.left

        // ------------------------------------------------------------------------------------------------------------
        // Проверяем столкновения. Причем важно именно столкновение, если постфактум
        // оказолось что сверху есть отступ, но двигались мы горизонтально, например, то это не считается,
        // так как столкновение было горизонтальным.
        // Для этого будем искать пересечение прямой, на которой лежит вектор перемещения с прямой, на
        // которой лежит сторона объекта, с которым проверяем столкновение
        // ------------------------------------------------------------------------------------------------------------
        // Функция проверки входит ли точка в область
        let pointInShape = function (point, shape) {
            let isContain = true

            for (let i = 0; i < shape.length; i++) {
                let sp = {
                    x: point.x - shape[i].x,
                    y: point.y - shape[i].y
                }
                let ss = {
                    x: i == shape.length - 1 ? shape[0].x - shape[i].x : shape[i + 1].x - shape[i].x,
                    y: i == shape.length - 1 ? shape[0].y - shape[i].y : shape[i + 1].y - shape[i].y
                }
                let vp = sp.x * ss.y - ss.x * sp.y
                if (vp > 0)
                    isContain = false
            }

            return isContain
        }
        let vectMult = function (a, b) {
            return a.x * b.y - b.x * a.y
        }

        // Столкновение при движении по горизонтали
        if (horShift >= 0) {
            let lp1 = {
                x: gmLeft - right,
                y: gmTop - top
            }
            let lp2 = {
                x: gmLeft - right,
                y: gmBottom - top
            }
            let rp1 = {
                x: gmLeft - right,
                y: gmTop - bottom
            }
            let rp2 = {
                x: gmLeft - right,
                y: gmBottom - bottom
            }
            let sd = {
                x: horShift,
                y: verShift
            }

            let pt = { x: gmLeft, y: gmTop }
            let pb = { x: gmLeft, y: gmBottom }
            let shape = []
            shape.push({ x: right + horShift, y: top + verShift })
            shape.push({ x: right + horShift, y: bottom + verShift })
            shape.push({ x: right, y: bottom })
            shape.push({ x: right, y: top })

            let isCross = (vectMult(lp1, sd) * vectMult(lp2, sd) <= 0
                || vectMult(rp1, sd) * vectMult(rp2, sd) <= 0)
                && gmLeft >= right && gmLeft <= right + horShift
                || pointInShape(pt, shape) || pointInShape(pb,shape)

            if (isCross)
                col.right = right + horShift - gmLeft
        } else if (horShift < 0) {
            let lp1 = {
                x: gmRight - left,
                y: gmTop - top
            }
            let lp2 = {
                x: gmRight - left,
                y: gmBottom - top
            }
            let rp1 = {
                x: gmRight - left,
                y: gmTop - bottom
            }
            let rp2 = {
                x: gmRight - left,
                y: gmBottom - bottom
            }
            let sd = {
                x: horShift,
                y: verShift
            }

            let pt = { x: gmRight, y: gmTop }
            let pb = { x: gmRight, y: gmBottom }
            let shape = []
            shape.push({ x: left, y: top })
            shape.push({ x: left, y: bottom })
            shape.push({ x: left + horShift, y: bottom + verShift })
            shape.push({ x: left + horShift, y: top + verShift })

            let isCross = (vectMult(lp1, sd) * vectMult(lp2, sd) <= 0
                || vectMult(rp1, sd) * vectMult(rp2, sd) <= 0)
                && gmRight >= left + horShift && gmRight <= left
                || pointInShape(pt, shape) || pointInShape(pb,shape)

            if (isCross)
                col.left = gmRight - left - horShift
        }

        // Столкновение при движении по вертикали
        if (verShift >= 0) {
            let lp1 = {
                x: left + horShift - gmLeft,
                y: bottom + verShift - gmTop
            }
            let lp2 = {
                x: left + horShift - gmRight,
                y: bottom + verShift - gmTop
            }
            let rp1 = {
                x: right + horShift - gmLeft,
                y: bottom + verShift - gmTop
            }
            let rp2 = {
                x: right + horShift - gmRight,
                y: bottom + verShift - gmTop
            }
            let sd = {
                x: horShift,
                y: verShift
            }

            let pl = { x: gmLeft, y: gmTop }
            let pr = { x: gmRight, y: gmTop }
            let shape = []
            shape.push({ x: right, y: bottom })
            shape.push({ x: right + horShift, y: bottom + verShift })
            shape.push({ x: left + horShift, y: bottom + verShift })
            shape.push({ x: left, y: bottom })

            let isCross = (vectMult(lp1, sd) * vectMult(lp2, sd) <= 0
                        || vectMult(rp1, sd) * vectMult(rp2, sd) <= 0)
                        && gmTop >= bottom && gmTop <= bottom + verShift
                        || pointInShape(pl, shape) || pointInShape(pr,shape)

            if (isCross)
                col.bottom = bottom + verShift - gmTop
        } else if (verShift < 0) {
            let lp1 = {
                x: gmLeft - left,
                y: gmBottom - top
            }
            let lp2 = {
                x: gmRight - left,
                y: gmBottom - top
            }
            let rp1 = {
                x: gmLeft - right,
                y: gmBottom - top
            }
            let rp2 = {
                x: gmRight - right,
                y: gmBottom - top
            }
            let sd = {
                x: horShift,
                y: verShift
            }

            let pl = { x: gmLeft, y: gmBottom }
            let pr = { x: gmRight, y: gmBottom }
            let shape = []
            shape.push({ x: right + horShift, y: top + verShift })
            shape.push({ x: right, y: top })
            shape.push({ x: left, y: top })
            shape.push({ x: left + horShift, y: top + verShift })

            let isCross = (vectMult(lp1, sd) * vectMult(lp2, sd) <= 0
                        || vectMult(rp1, sd) * vectMult(rp2, sd) <= 0)
                        && gmBottom >= top + verShift && gmBottom <= top
                        || pointInShape(pl, shape) || pointInShape(pr,shape)

            if (isCross)
                col.top = gmBottom - top - verShift
        }

        if (col.top !== null || col.right !== null || col.bottom !== null || col.left !== null)
            return col
        else return null
    }

    // Обновление состояния юнита
    this.updateFrame = function () {
        this.hitbox.top = this.y
        this.hitbox.right = this.x + this.width
        this.hitbox.bottom = this.y + this.height
        this.hitbox.left = this.x

        switch (this.state) {
            case "goRight":
                if (this.sprite != unitSprites.goRight) {
                    this.sprite = unitSprites.goRight
                    this.sprite.reset()
                }
                break
            case "goLeft":
                if (this.sprite != unitSprites.goLeft) {
                    this.sprite = unitSprites.goLeft
                    this.sprite.reset()
                }
                break
            default:
                if (this.direction == 'right' && this.sprite != unitSprites.idleRight) {
                    this.sprite = unitSprites.idleRight
                    this.sprite.reset()
                } else if (this.direction == 'left' && this.sprite != unitSprites.idleLeft) {
                    this.sprite = unitSprites.idleLeft
                    this.sprite.reset()
                }
        }
        this.sprite.update()
    },

    // Рендер юнита
    this.render = function () {
        // Вычисляем координаты юнита с учетом смещения реального игроового поля
        let actX = this.x - (this.renderWidth - this.width) / 2
        let actY = this.y - (this.renderHeight - this.height) / 2

        // Рендерим юнит
        this.sprite.render(ctx, actX, actY)
        // ctx.strokeRect(this.hitbox.left, this.hitbox.top, this.hitbox.right - this.hitbox.left, this.hitbox.bottom - this.hitbox.top)
    }
}
