function Box(ctx, objectPattern, x, y, width, height) {
    GameObject.apply(this, arguments)

    this.type = 'box'
    
    this.destroy = function () {
        this.x = 0;
        this.y = 0
        this.width = 0
        this.height = 0

        this.hitbox.top = 0
        this.hitbox.right = 0
        this.hitbox.bottom = 0
        this.hitbox.left = 0
    }
}
