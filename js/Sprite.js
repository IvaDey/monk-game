function Sprite(spriteImg) {
    this.framesCount = spriteImg.width / spriteImg.height
    this.curPos = spriteImg.height

    // Обновление состояния спрайта
    this.update = function () {
        this.curPos += spriteImg.height
        if (this.curPos >= this.framesCount * spriteImg.height) {
            this.curPos = 0
        }
    },

    // Рендер юнита
    this.render = function (ctx, x, y) {
        // Рендерим изображение
        ctx.drawImage(spriteImg, this.curPos, 0, spriteImg.height, spriteImg.height, x, y, spriteImg.height, spriteImg.height)
    }

    this.reset = function () {
        this.curPos = 0
    }
}
