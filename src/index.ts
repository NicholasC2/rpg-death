import { clearScreen } from "./draw";
import { Game, isColliding, Level, Player, TILES_HORIZONTAL, TILES_VERTICAL } from "./game";

function startGame(
    levels: Level[] = [],
    startLevelIndex = 0,
    debug = false
): Game {
    const canvas = document.querySelector("#game");

    if (!(canvas instanceof HTMLCanvasElement))
        throw new Error("#game is not a canvas or not present");

    canvas.width = 800;
    canvas.height = 600;

    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Couldn't get canvas context");

    const game: Game = {
        player: new Player(150, 290),
        levels,
        currentLevel: startLevelIndex,
        canvas,
        ctx,

        setLevel(index: number) {
            this.currentLevel = index;
        },

        nextLevel() {
            if (this.currentLevel < this.levels.length - 1) {
                this.currentLevel++;
            }
        }
    };

    const keys: string[] = [];

    document.addEventListener("keydown", (ev) => {
        if(!keys.includes(ev.key)) keys.push(ev.key);
    })

    document.addEventListener("keyup", (ev) => {
        while(keys.includes(ev.key)) keys.splice(keys.indexOf(ev.key), 1);
    })

    function loop() {
        if(!(canvas instanceof HTMLCanvasElement)) return;
        if(!ctx) return;
        clearScreen(ctx, canvas);

        if(game.currentLevel < levels.length) {
            const lvl = levels[game.currentLevel];
            
            lvl.draw(ctx, canvas);
            
            if(lvl.update) {
                lvl.update(game);
            }
        }
        
        if(debug) debugDraw()

        game.player.draw(ctx);
        requestAnimationFrame(loop);
    }

    function debugDraw() {
        if(!ctx) return;
        ctx.strokeStyle = "lime";
        ctx.lineWidth = 2;

        for(const object of levels[game.currentLevel].objects) {
            if("w" in object) {
                ctx.strokeRect(object.x + 1, object.y + 1, object.w - 2, object.h - 2);
            }
        }
    }

    const MOVE_SPEED = 2;

    function fixedLoop() {
        let moveX = Number(keys.includes("d")) - Number(keys.includes("a"));
        let moveY = Number(keys.includes("s")) - Number(keys.includes("w"));

        if (moveX === 0 && moveY === 0) return;

        const length = Math.hypot(moveX, moveY);
        moveX = (moveX / length) * MOVE_SPEED;
        moveY = (moveY / length) * MOVE_SPEED;

        game.player.x += moveX;
        if (isPlayerColliding() || game.player.x < 0 || game.player.x + 20 > 800) {
            game.player.x -= moveX;
        }

        game.player.y += moveY;
        if (isPlayerColliding() || game.player.y < 0 || game.player.y + 20 > 600) {
            game.player.y -= moveY;
        }
    }

    function isPlayerColliding(): boolean {
        if(!(canvas instanceof HTMLCanvasElement)) return false;
        let collided = false;

        const playerRect = {
            x: game.player.x,
            y: game.player.y,
            w: 20,
            h: 20,
        };

        if (game.currentLevel >= levels.length) return false;

        for (const rect of levels[game.currentLevel].objects) {
            if("w" in rect) {
                if(isColliding(
                    rect,
                    playerRect
                )) {
                    collided = true;
                }
            } else {
                if(!rect.collideWithPlayer) continue;

                let tileRect = {
                    x: rect.x * (canvas.width / TILES_HORIZONTAL),
                    y: rect.y * (canvas.height / TILES_VERTICAL),
                    texture: rect.texture,
                    w: canvas.width / TILES_HORIZONTAL,
                    h: canvas.height / TILES_VERTICAL
                }

                if(isColliding(
                    tileRect,
                    playerRect
                )) {
                    collided = true;
                }
            }
        }

        return collided;
    }

    setInterval(fixedLoop, 16);

    loop();

    return game;
}

const lava = new Image()
lava.src = "assets/lava.png"

const dirt = new Image()
dirt.src = "assets/dirt.png"

const dirtEdgeTop = new Image()
dirtEdgeTop.src = "assets/dirt-edge-top.png"

const dirtEdgeBottom = new Image()
dirtEdgeBottom.src = "assets/dirt-edge-bottom.png"

const dirtEdgeLeft = new Image()
dirtEdgeLeft.src = "assets/dirt-edge-left.png"

const dirtCornerTopLeft = new Image()
dirtCornerTopLeft.src = "assets/dirt-corner-top-left.png"

const dirtCornerBottomLeft = new Image()
dirtCornerBottomLeft.src = "assets/dirt-corner-bottom-left.png"

const lvl1 = new Level([], undefined, (ctx) => {
    if(ctx.player.x >= 760) {
        ctx.setLevel(1);
        ctx.player.x = 50;
    }
});

for(let y = 0; y < TILES_VERTICAL; y++) {
    for(let x = 0; x < TILES_HORIZONTAL; x++) {
        if(y >= 2 && y <= 3 && x >= 1) {
            lvl1.objects.push({
                collideWithPlayer: false,
                x,
                y,
                texture: dirt
            })
        } else {
            lvl1.objects.push({
                collideWithPlayer: true,
                x,
                y,
                texture: lava
            })
        }

        if(y == 1 && x >= 1) {
            lvl1.objects.push({
                collideWithPlayer: false,
                x,
                y,
                texture: dirtEdgeTop
            })
        }

        if(y == 4 && x >= 1) {
            lvl1.objects.push({
                collideWithPlayer: false,
                x,
                y,
                texture: dirtEdgeBottom
            })
        }

        if(x == 0 && y >= 2 && y <= 3) {
            lvl1.objects.push({
                collideWithPlayer: false,
                x,
                y,
                texture: dirtEdgeLeft
            })
        }
    }
}

lvl1.objects.push({
    collideWithPlayer: false,
    x: 0,
    y: 1,
    texture: dirtCornerTopLeft
})

lvl1.objects.push({
    collideWithPlayer: false,
    x: 0,
    y: 4,
    texture: dirtCornerBottomLeft
})

const lvl2 = new Level([], undefined, (ctx)=>{
    if(ctx.player.x <= 40) {
        ctx.setLevel(0);
        ctx.player.x = 750;
    }
});

for(let y = 0; y < TILES_VERTICAL; y++) {
    for(let x = 0; x < TILES_HORIZONTAL; x++) {
        if((y < 2 || y > 3) && x <= 0) {
            lvl2.objects.push({
                collideWithPlayer: true,
                x,
                y,
                texture: lava
            })

            if(y > 0 && y < 5) {
                lvl2.objects.push({
                    collideWithPlayer: false,
                    x,
                    y,
                    texture: dirtEdgeLeft
                })
            }
        } else {
            if(y > 0 && y < 5) {
                lvl2.objects.push({
                    collideWithPlayer: false,
                    x,
                    y,
                    texture: dirt
                })
            } else {
                lvl2.objects.push({
                    collideWithPlayer: true,
                    x,
                    y,
                    texture: lava
                })
            }
        }

        if(x > 0) {
            if(y == 0) {
                lvl2.objects.push({
                    collideWithPlayer: false,
                    x,
                    y,
                    texture: dirtEdgeTop
                })
            }

            if(y == 5) {
                lvl2.objects.push({
                    collideWithPlayer: false,
                    x,
                    y,
                    texture: dirtEdgeBottom
                })
            }
        }
    }
}

lvl2.objects.push({
    collideWithPlayer: false,
    x: 0,
    y: 1,
    texture: dirtEdgeTop
})

lvl2.objects.push({
    collideWithPlayer: false,
    x: 0,
    y: 4,
    texture: dirtEdgeBottom
})

lvl2.objects.push({
    collideWithPlayer: false,
    x: 0,
    y: 0,
    texture: dirtCornerTopLeft
})

lvl2.objects.push({
    collideWithPlayer: false,
    x: 0,
    y: 5,
    texture: dirtCornerBottomLeft
})

startGame([
    lvl1,
    lvl2
]);