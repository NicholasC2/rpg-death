import { clearScreen } from "./draw";
import { isColliding, Level, Player } from "./game";

function startGame(levels: Level[] = [], startLevelIndex: number = 0, debug: Boolean = false) {
    let currentLevel = startLevelIndex;

    const canvas = document.querySelector("#game");

    if(!(canvas instanceof HTMLCanvasElement)) throw new Error("#game is not a canvas or not present");

    canvas.width = 800;
    canvas.height = 600;

    const ctx = canvas.getContext("2d");

    const player = new Player(10, 10)

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
        
        if(debug) debugDraw()

        player.draw(ctx);
        requestAnimationFrame(loop);
    }

    function debugDraw() {
        if(!ctx) return;
        ctx.strokeStyle = "lime";
        ctx.lineWidth = 2;

        for(const object of levels[currentLevel].objects) {
            ctx.strokeRect(object.x + 1, object.y + 1, object.w - 2, object.h - 2);
        }
    }

    function fixedLoop() { //60fps
        const keysFrame = keys;

        let moveByX = (Number(keysFrame.includes("s")) - Number(keysFrame.includes("w")));
        let moveByY = (Number(keysFrame.includes("d")) - Number(keysFrame.includes("a")));

        player.x += moveByY;

        if(isPlayerColliding()) {
            player.x -= moveByY;
        }

        player.y += moveByX;

        if(isPlayerColliding()) {
            player.y -= moveByX;
        }
    }

    function isPlayerColliding(): boolean {
        let collided = false;

        const playerRect = {
            x: player.x,
            y: player.y,
            w: 20,
            h: 20,
        };

        if(levels.length <= 0) return false;

        for (const rect of levels[currentLevel].objects) {
            if(isColliding(
                rect,
                playerRect
            )) {
                collided = true;
            }
        }

        return collided;
    }

    setInterval(fixedLoop, 16);

    loop();
}

startGame();