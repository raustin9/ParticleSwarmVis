export class Particle {
    constructor(xpos, ypos, radius, speed, color, init_xdir, init_ydir) {
        this.xpos = xpos;
        this.ypos = ypos;
        this.radius = radius;
        this.speed = speed;
        this.color = color;
        this.init_xdir = init_xdir;
        this.init_ydir = init_ydir;

        this.dx = 1 * this.speed * this.init_xdir;
        this.dy = 1 * this.speed * this.init_ydir;
    }

    draw(context) {
        // console.log(this.xpos, this.ypos, this.radius, this.speed, this.color);

        context.beginPath();

        context.arc(this.xpos, this.ypos, this.radius, 0, 2 * Math.PI);
        context.strokeStyle = this.color;
        context.stroke();
        // context.fillStyle = this.color;
        // context.fill();

        context.closePath();
    }

    update(context) {
        this.draw(context);

        // check for walls
        if (this.xpos + this.radius > context.canvas.width) {
            this.dx *= -1;
        }

        if (this.xpos - this.radius < 0) {
            this.dx *= -1;
        }

        if (this.ypos + this.radius > context.canvas.height) {
            this.dy *= -1;
        }

        if (this.ypos - this.radius < 0) {
            this.dy *= -1;
        }

        this.xpos += this.dx;
        this.ypos += this.dy;
    }
}
