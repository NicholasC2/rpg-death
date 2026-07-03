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

export type Object = Rect & {
    texture?: HTMLImageElement;
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
    objects: Object[];
    background?: HTMLImageElement;

    constructor(objects: Object[], background?: HTMLImageElement) {
        this.objects = objects;
        this.background = background;
    }

    draw(ctx: CanvasRenderingContext2D) {
        for (const object of this.objects) {
            if(!object.texture) continue;
            if(!object.texture.complete) continue;

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