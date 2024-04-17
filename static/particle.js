export class Particle {
    constructor(xpos, ypos, radius, color) {
        this.xpos = xpos;
        this.ypos = ypos;
        this.radius = radius;
        this.color = color;
    }

    draw(context) {
        console.log(this.xpos, this.ypos, this.radius, this.color);

        context.beginPath();

        context.arc(this.xpos, this.ypos, this.radius, 0, 2 * Math.PI);
        context.fillStyle = this.color;
        context.fill();

        context.closePath();
    }
}
