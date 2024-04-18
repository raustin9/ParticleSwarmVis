import { rotateVelocities, distance } from './util';

export class Particle {
    constructor(xpos, ypos, radius, speed, color, init_xdir, init_ydir) {
        this.xpos = xpos;
        this.ypos = ypos;
        this.radius = radius;
        this.speed = speed;
        this.color = color;
        this.init_xdir = init_xdir;
        this.init_ydir = init_ydir;
        this.velocity = {
            x: 1 * this.speed * this.init_xdir,
            y: 1 * this.speed * this.init_ydir,
        };
        this.mass = 1;
    }

    draw(context) {
        context.beginPath();

        context.arc(this.xpos, this.ypos, this.radius, 0, 2 * Math.PI);
        context.strokeStyle = this.color;
        context.stroke();
        // context.fillStyle = this.color;
        // context.fill();

        context.closePath();
    }

    // this = current this
    // particles = array of all particles
    update = (context, particles) => {
        this.draw(context);

        for (let i = 0; i < particles.length; i++) {
            const otherParticle = particles[i];
            if ((this.x = otherParticle.x)) continue;

            if (
                distance(this.posx, this.posy, otherParticle.posx, otherParticle.posy) -
                    this.radius * 2 <
                0
            ) {
                const res = {
                    x: this.velocity.x - otherParticle.velocity.x,
                    y: this.velocity.y - otherParticle.velocity.y,
                };

                if (
                    res.x * (otherParticle.posx - this.posx) +
                        res.y * (otherParticle.posy - this.posy) >=
                    0
                ) {
                    const m1 = this.mass;
                    const m2 = otherParticle.mass;
                    const theta = -Math.atan2(
                        otherParticle.posy - this.posy,
                        otherParticle.posx - this.posx
                    );

                    const rotatedVelocity1 = rotatedVelocities(this.velocity, theta);
                    const rotatedVelocity2 = rotatedVelocities(otherParticle.velocity, theta);

                    const swapVelocity1 = {
                        x:
                            (rotatedVelocity1.x * (m1 - m2)) / (m1 + m2) +
                            (rotatedVelocity2.x * 2 * m2) / (m1 + m2),
                        y: rotatedVelocity1.y,
                    };
                    const swapVelocity2 = {
                        x:
                            (rotatedVelocity2.x * (m1 - m2)) / (m1 + m2) +
                            (rotatedVelocity1.x * 2 * m2) / (m1 + m2),
                        y: rotatedVelocity2.y,
                    };

                    const u1 = rotateVelocities(swapVelocity1, -theta);
                    const u2 = rotateVelocities(swapVelocity2, -theta);

                    this.velocity.x = u1.x;
                    this.velocity.y = u1.y;
                    otherParticle.velocity.x = u2.x;
                    otherParticle.velocity.y = u2.y;
                }
            }
        }

        // check for walls
        if (this.xpos + this.radius > context.canvas.width || this.xpos - this.radius < 0) {
            this.velocity.x *= -1;
        }

        if (this.ypos + this.radius > context.canvas.height || this.ypos - this.radius < 0) {
            this.velocity.y *= -1;
        }

        this.xpos += this.velocity.x;
        this.ypos += this.velocity.y;
    };
}
