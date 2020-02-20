function GameObject(ctx, objectPattern, x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height

    // Хитбокс объекта
    this.hitbox = {
        top: this.y,
        right: this.x + this.width,
        bottom: this.y + this.height,
        left: this.x
    }

    // Силы, действующие на объект
    this.forcesVect = {
        up: {
            v: 0,   // Скорость
            a: 0    // Ускороение
        },
        right: {
            v: 0,   // Скорость
            a: 0    // Ускороение
        },
        down: {
            v: 0,   // Скорость
            a: 0    // Ускороение
        },
        left: {
            v: 0,   // Скорость
            a: 0    // Ускороение
        }
    }
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

    this.type = 'static'
    this.isVisible = true

    this.ctx = ctx
    this.objectPattern = objectPattern

    if (this.objectPattern)
        this.fillPattern = this.ctx.createPattern(this.objectPattern, 'repeat')
    else this.fillPattern = '#000000'

    this.updateFrame = function () {
    }
    
    this.render = function () {
        if (this.width == this.objectPattern.width && this.height == this.objectPattern.height)
            this.ctx.drawImage(this.objectPattern, this.x, this.y, this.width, this.height)
        else {
            this.ctx. save()

            this.ctx.fillStyle = this.fillPattern
            this.ctx.fillRect(this.x, this.y, this.width, this.height)

            this.ctx.restore()
        }
    }

    // Проверка на коллизию с другим объектом апостериорным методом
    this.checkCollision = function (gmObj) {
        let col = {
            type: 'static',
            top: null,
            right: null,
            bottom: null,
            left: null
        }

        // Хитбокс текущего объекта
        let top = this.hitbox.top
        let right = this.hitbox.right
        let bottom = this.hitbox.bottom
        let left = this.hitbox.left

        // Хитбокс объекта, с которым необходимо проверить столкновение
        let gmTop = gmObj.hitbox.top
        let gmRight = gmObj.hitbox.right
        let gmBottom = gmObj.hitbox.bottom
        let gmLeft = gmObj.hitbox.left

        // Проверяем столкновение по горизонтали – только если по вертикали объекты совпадают
        if (gmTop > top && gmTop < bottom || gmBottom > top && gmBottom < bottom) {
            // Проверяем столкновение с правой стороны
            if (gmLeft >= left && gmLeft <= right)
                col.right = right - gmLeft

            // Проверяем столкновение с левой стороны
            if (gmRight >= left && gmRight <= right)
                col.left = gmRight - left

            // Если получили столкновение с двух сторон, то один объект находится внутри другого
            // Тогда необходимо необходимо оставить только одно – меньшее
            if (col.left && col.right) {
                if (col.left < col.right)
                    col.right = null
                else col.left = null
            }
        }

        // Проверяем столкновение по вертикали –только в том случае, если объекты совпадают по горизонтали
        if (gmLeft > left && gmLeft < right || gmRight > left && gmRight < right) {
            // Проверяем столкновение с верхней стороны
            if (gmTop >= top && gmTop <= bottom)
                col.bottom = bottom - gmTop

            // Проверяем столкновение с нижней стороны
            if (gmBottom >= top && gmBottom <= bottom)
                col.top = gmBottom - top

            // Если получили столкновение с двух сторон, то один объект находится внутри другого
            // Тогда необходимо необходимо оставить только одно – меньшее
            if (col.top && col.bottom) {
                if (col.top < col.bottom)
                    col.bottom = null
                else col.top = null
            }
        }

        return col
    }

    // Проверка на коллизию с другим объектом априорным методом методом
    this.predictCollision = function (gmObj, dt) {
        let col = {
            // type: 'potential',
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
        let vectComposition = function (a, b) {
            return a.x * b.y - b.x * a.y
        }

        // Столкновение при движении по горизонтали
        if (horShift > 0) {
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

            let isCross = (vectComposition(lp1, sd) * vectComposition(lp2, sd) <= 0
                || vectComposition(rp1, sd) * vectComposition(rp2, sd) <= 0)
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

            let isCross = (vectComposition(lp1, sd) * vectComposition(lp2, sd) <= 0
                || vectComposition(rp1, sd) * vectComposition(rp2, sd) <= 0)
                && gmRight >= left + horShift && gmRight <= left
                || pointInShape(pt, shape) || pointInShape(pb,shape)

            if (isCross)
                col.left = gmRight - left - horShift
        }

        // Столкновение при движении по вертикали
        if (verShift > 0) {
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

            let isCross = (vectComposition(lp1, sd) * vectComposition(lp2, sd) <= 0
                || vectComposition(rp1, sd) * vectComposition(rp2, sd) <= 0)
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

            let isCross = (vectComposition(lp1, sd) * vectComposition(lp2, sd) <= 0
                || vectComposition(rp1, sd) * vectComposition(rp2, sd) <= 0)
                && gmBottom >= top + verShift && gmBottom <= top
                || pointInShape(pl, shape) || pointInShape(pr,shape)

            if (isCross)
                col.top = gmBottom - top - verShift
        }

        if (col.top !== null || col.right !== null || col.bottom !== null || col.left !== null)
            return col
        else return null
    }

}
