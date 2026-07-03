export const TILES_HORIZONTAL=8
export const TILES_VERTICAL=6

export type Game = {
    player: Player;
    levels: Level[];
    currentLevel: number;
    setLevel(index: number): void;
    nextLevel(): void;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
};

export class Player {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, 20, 20);
    }
}

type Rect = {
    x: number;
    y: number;
    w: number;
    h: number;
}

type Image = {
    texture?: HTMLImageElement;
}

export type Object = Rect & Image

export type Tile = Image & {
    x: number;
    y: number;
    collideWithPlayer: Boolean;
}

export function isColliding(
    rect1: Rect,
    rect2: Rect
): boolean {
    return (
        rect1.x < rect2.x + rect2.w &&
        rect1.x + rect1.w > rect2.x &&
        rect1.y < rect2.y + rect2.h &&
        rect1.y + rect1.h > rect2.y
    );
}

export class Level {
    objects: (Object | Tile)[];
    background?: HTMLImageElement;
    update?: (ctx: Game) => void;

    constructor(objects: (Object | Tile)[], background?: HTMLImageElement, update?: (ctx: Game) => void) {
        this.objects = objects;
        this.background = background;
        this.update = update;
    }

    draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        for (const object of this.objects) {
            if(!object.texture) continue;
            if(!object.texture.complete) continue;

            if(!("w" in object && "h" in object)) {
                ctx.drawImage(
                    object.texture,
                    object.x * (canvas.width / TILES_HORIZONTAL),
                    object.y * (canvas.height / TILES_VERTICAL),
                    canvas.width / TILES_HORIZONTAL,
                    canvas.height / TILES_VERTICAL
                );

                continue;
            }

            ctx.drawImage(
                object.texture,
                object.x,
                object.y,
                object.w,
                object.h
            );
        }
    }
}

const imageCache = new Map<string, HTMLImageElement>();

export function loadImage(src: string): HTMLImageElement {
    let img = imageCache.get(src);

    if (!img) {
        img = new Image();
        img.src = src;
        imageCache.set(src, img);
    }

    return img;
}