(function () {
    let dataCount = 0
    let sprites = {}
    let sounds = {}
    let readyCallbacks = []

    let load = function (dataRequired) {
        dataCount = 0

        if (dataRequired.sprites)
            dataCount += Object.keys(dataRequired.sprites).length
        // if (dataRequired.sounds)
        //     dataCount += Object.keys(dataRequired.sounds).length

        for (let resName in dataRequired.sprites)
            _loadSprite(resName, dataRequired.sprites[resName])
        for (let resName in dataRequired.sounds)
            _loadSound(resName, dataRequired.sounds[resName])
    }

    let _loadSprite = function (resName, url) {
        let img = new Image()
        img.onload = function () {
            sprites[resName] = img

            if(isReady()) {
                readyCallbacks.forEach(function(func) { func(); });
            }

        }
        img.src = url
    }

    let _loadSound = function (resName, url) {
        let sound = new Audio()
        // sound.onload = function () {
        //     sounds[resName] = sound
        //
        //     if(isReady()) {
        //         readyCallbacks.forEach(function(func) { func(); });
        //     }
        //
        // }
        sound.src = url
        sounds[resName] = sound
    }

    let isReady = function () {
        let curCount = 0

        for (let key in sprites) {
            curCount++
        }
        // for (let key in sounds) {
        //     curCount++
        // }

        console.log("Resources loading: " + curCount + " of " + dataCount + " (" + Math.round(curCount / dataCount * 100) + "%)")

        return curCount == dataCount
    }

    let onload = function (func) {
        readyCallbacks.push(func)
    }

    window.resources = {
        load: load,
        onload: onload,
        sprites: sprites,
        sounds: sounds
    }
})()