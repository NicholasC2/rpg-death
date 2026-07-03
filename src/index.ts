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

    function debugDraw() {         // source height
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

const lvl1 = new Level([]);

for(let y = 0; y < TILES_VERTICAL; y++) {
    for(let x = 0; x < TILES_HORIZONTAL; x++) {
        if(y >= 2 && y <= 3 && x >= 1 && x <= 6) {
            lvl1.objects.push({
                frame: 0,
                collideWithPlayer: false,
                x,
                y,
                texture: dirt
            })
        } else {
            lvl1.objects.push({
                frame: 0,
                collideWithPlayer: true,
                x,
                y,
                texture: lava
            })
        }
    }
}

startGame([
    lvl1
]);