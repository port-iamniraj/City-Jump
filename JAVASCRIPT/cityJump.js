const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

const gravity = 0.5;

class Player {
    constructor() {
        this.speed = 10;
        this.position = {
            x: 100,
            y: 100
        };
        this.velocity = {
            x: 0,
            y: 0
        };
        this.width = 66;
        this.height = 150;
        this.image = createImage('./IMAGES/Sprites/spriteStandRight.png');
        this.frames = 0;
        this.sprites = {
            stand: {
                right: createImage('./IMAGES/Sprites/spriteStandRight.png'),
                left: createImage('./IMAGES/Sprites/spriteStandLeft.png'),
                cropWidth: 177,
                width: 66
            },
            run: {
                right: createImage('./IMAGES/Sprites/spriteRunRight.png'),
                left: createImage('./IMAGES/Sprites/spriteRunLeft.png'),
                cropWidth: 341,
                width: 127.875
            }
        };
        this.currentSprite = this.sprites.stand.right;
        this.currentCropWidth = 177;
    }

    draw() {
        c.drawImage(this.currentSprite,
            this.currentCropWidth * this.frames,
            0,
            this.currentCropWidth,
            400,
            this.position.x,
            this.position.y,
            this.width,
            this.height);
    }

    update() {
        this.frames++;
        if (this.frames > 59 && (this.currentSprite === this.sprites.stand.right || this.currentSprite === this.sprites.stand.left)) {
            this.frames = 0;
        }
        else if (this.frames > 29 && (this.currentSprite === this.sprites.run.right || this.currentSprite === this.sprites.run.left)) {
            this.frames = 0;
        }
        this.draw();
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;
        if (this.position.y + this.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity;
        }
    }
}

class Platform {
    constructor({ x, y, image }) {
        this.position = {
            x,
            y
        };
        this.image = image;
        this.width = image.width;
        this.height = 125;
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y);
    }

    collidesWith(player) {
        return (
            player.position.y + player.height >= this.position.y &&
            player.position.y <= this.position.y + this.height &&
            player.position.x + player.width >= this.position.x &&
            player.position.x <= this.position.x + this.width
        );
    }
}

class GenericObject {
    constructor({ x, y, image }) {
        this.position = {
            x,
            y
        };
        this.image = image;
        this.width = image.width;
        this.height = 125;
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y);
    }
}

function createImage(imageSrc) {
    const image = new Image();
    image.src = imageSrc;
    return image;
}

let platformImage;
let platformSmallTallImage;
let player = new Player();
let platforms = [];
let genericObjects = [];

let lastKey;
const keys = {
    right: {
        pressed: false
    },
    left: {
        pressed: false
    }
    ,
    space: {
        pressed: false
    }
};

let scrollOfset = 0;

function init() {
    platformImage = createImage('./IMAGES/Platforms/platform.png');
    platformSmallTallImage = createImage('./IMAGES/Platforms/platformSmallTall.png');

    player = new Player();
    platforms = [
        new Platform({
            x: platformImage.width * 4 + 500 - 2 + platformImage.width - platformSmallTallImage.width,
            y: canvas.height - platformImage.height - 200,
            image: platformSmallTallImage,
        }),
        new Platform({
            x: 0,
            y: canvas.height - platformImage.height,
            image: platformImage,
        }),
        new Platform({
            x: platformImage.width - 2,
            y: canvas.height - platformImage.height,
            image: platformImage,
        }),
        new Platform({
            x: platformImage.width * 2 + 200,
            y: canvas.height - platformImage.height,
            image: platformImage,
        }),
        new Platform({
            x: platformImage.width * 3 + 500,
            y: canvas.height - platformImage.height,
            image: platformImage,
        }),
        new Platform({
            x: platformImage.width * 4 + 500 - 2,
            y: canvas.height - platformImage.height,
            image: platformImage,
        }),
        new Platform({
            x: platformImage.width * 7,
            y: canvas.height - platformImage.height,
            image: platformImage,
        }),
    ];

    genericObjects = [
        new GenericObject({
            x: 0,
            y: 0,
            image: createImage('./IMAGES/Platforms/background.png')
        }),
        new GenericObject({
            x: 0,
            y: 0,
            image: createImage('./IMAGES/Platforms/hills.png')
        }),
    ];

    scrollOfset = 0;
}

function animate() {
    requestAnimationFrame(animate);
    c.fillStyle = "#333";
    c.fillRect(0, 0, canvas.width, canvas.height);

    genericObjects.forEach(genericObject => {
        genericObject.draw();
    });
    platforms.forEach(platform => {
        platform.draw();
    });
    player.update();

    if (keys.right.pressed && player.position.x < 400) {
        player.velocity.x = player.speed;
    }
    else if (
        (keys.left.pressed && player.position.x > 100) || (keys.left.pressed && scrollOfset === 0 && player.position.x > 0)) {
        player.velocity.x = -player.speed;
    }
    else {
        player.velocity.x = 0;

        if (keys.right.pressed) {
            scrollOfset += player.speed;
            platforms.forEach(platform => {
                platform.position.x -= player.speed;
            });
            genericObjects.forEach(genericObject => {
                genericObject.position.x -= player.speed * 0.66;
            });
        }
        else if (keys.left.pressed && scrollOfset > 0) {
            scrollOfset -= player.speed;
            platforms.forEach(platform => {
                platform.position.x += player.speed;
            });
            genericObjects.forEach(genericObject => {
                genericObject.position.x += player.speed * 0.66;
            });
        }
    }

    // platforms.forEach(platform =>{
    //     if(player.position.y + player.height <= platform.position.y &&  
    //         player.position.y + player.height + player.velocity.y >= platform.position.y &&
    //         player.position.x + player.width >= platform.width &&   
    //         player.position.x <= platform.position.x + platform.width){
    //         player.velocity.y = 0;
    //     }
    // });


    // if(scrollOfset > 2000){
    //     console.log("you win");
    // }

    platforms.forEach((platform) => {
        if (platform.collidesWith(player) && player.velocity.y > 0) {
            player.velocity.y = 0;
            player.position.y = platform.position.y - player.height;
        }
    });

    // sprite switching
    if (keys.right.pressed && lastKey === "right" && player.currentSprite !== player.sprites.run.right) {
        player.frames = 1;
        player.currentSprite = player.sprites.run.right;
        player.currentCropWidth = player.sprites.run.cropWidth;
        player.width = player.sprites.run.width;
    }
    else if (keys.left.pressed && lastKey === "left" && player.currentSprite !== player.sprites.run.left) {
        player.currentSprite = player.sprites.run.left;
        player.currentCropWidth = player.sprites.run.cropWidth;
        player.width = player.sprites.run.width;
    }
    else if (!keys.left.pressed && lastKey === "left" && player.currentSprite !== player.sprites.stand.left) {
        player.currentSprite = player.sprites.stand.left;
        player.currentCropWidth = player.sprites.stand.cropWidth;
        player.width = player.sprites.stand.width;
    }
    // else if(!keys.right.pressed && lastKey === "right" && player.currentSprite !== player.sprites.stand.right){
    //     player.currentSprite = player.sprites.stand.right;
    //     player.currentCropWidth = player.sprites.stand.cropWidth;
    //     player.width = player.sprites.stand.width;
    // }

    // win condition
    if (scrollOfset > platformImage.width * 4 + 500 - 2 + platformImage.width - platformSmallTallImage.width) {
        console.log("you win");
    }

    // loose condition
    if (player.position.y > canvas.height) {
        init();
    }
}

init();
animate();

addEventListener("keydown", ({ key }) => {
    switch (key) {
        case "ArrowRight":
            console.log("right");
            keys.right.pressed = true;
            lastKey = "right";
            break;

        case "ArrowLeft":
            console.log("left");
            keys.left.pressed = true;
            lastKey = "left";
            break;

        case " ":
            console.log("jump");
            player.velocity.y -= 15;
            keys.space.pressed = true;
            break;
    }
    console.log(keys.right.pressed);
});

addEventListener("keyup", ({ key }) => {
    switch (key) {
        case "ArrowRight":
            keys.right.pressed = false;
            player.currentSprite = player.sprites.stand.right;
            player.currentCropWidth = player.sprites.stand.cropWidth;
            player.width = player.sprites.stand.width;
            break;

        case "ArrowLeft":
            keys.left.pressed = false;
            break;

        case " ":
            keys.space.pressed = false;
            break;
    }
    console.log(keys.right.pressed);
});