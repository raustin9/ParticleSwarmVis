import { rotateVelocities, distance } from './util.js';

export class Particle {
    /**
     * @title Particle Constructor
     *
     * @param {number} xpos X-coordinate position of the particle
     * @param {number} ypos Y-coordinate position of the particle
     * @param {number} radius Size of particle
     * @param {number} speed Initial Speed
     * @param {string} color Hex code for grid line color
     * @param {boolean} fill If the particles are filled or outlines
     * @param {number} init_xdir Randomly assigned value (1 | -1) to set initial direction in X direction
     * @param {number} init_ydir Randomly assigned value (1 | -1) to set initial direction in Y direction
     * @param {Object} velocity Speed parameter with direction
     */
    constructor(xpos, ypos, radius, speed, color, fill, init_xdir, init_ydir) {
        this.xpos = xpos;
        this.ypos = ypos;
        this.radius = radius;
        this.speed = speed;
        this.color = color;
        this.fill = fill;
        this.init_xdir = init_xdir;
        this.init_ydir = init_ydir;
        this.velocity = {
            x: 1 * this.speed * this.init_xdir,
            y: 1 * this.speed * this.init_ydir,
        };
        this.mass = 1;
    }

    /**
     * @title draw(context)
     * @description Draws circle based on class parameters
     *
     * @param {CanvasRenderingContext2D} context Context of canvas element
     */
    draw(context) {
        context.beginPath();

        context.arc(this.xpos, this.ypos, this.radius, 0, 2 * Math.PI);

        if (this.filled) {
            context.fillStyle = this.color;
            context.fill();
        } else {
            context.strokeStyle = this.color;
            context.stroke();
        }

        context.closePath();
    }

    /**
     * @title update(context, particles)
     * @description Updates particle motion accounting for canvas boundaries and collisions
     *
     * @param {CanvasRenderingContext2D} context Context of canvas element
     * @param {Particle[]} particles Array containing of rendered particles
     */
    update(context, particles) {
        this.draw(context);

        // check for collisions
        for (let i = 0; i < particles.length; i++) {
            const otherParticle = particles[i];
            if (this.xpos === otherParticle.xpos) continue;

            if (
                distance(this.xpos, this.ypos, otherParticle.xpos, otherParticle.ypos) -
                    this.radius * 2 <
                0
            ) {
                console.log('contact');
                const res = {
                    x: this.velocity.x - otherParticle.velocity.x,
                    y: this.velocity.y - otherParticle.velocity.y,
                };

                if (
                    res.x * (otherParticle.xpos - this.xpos) +
                        res.y * (otherParticle.ypos - this.ypos) >=
                    0
                ) {
                    const m1 = this.mass;
                    const m2 = otherParticle.mass;
                    const theta = -Math.atan2(
                        otherParticle.ypos - this.ypos,
                        otherParticle.xpos - this.xpos
                    );

                    const rotatedVelocity1 = rotateVelocities(this.velocity, theta);
                    const rotatedVelocity2 = rotateVelocities(otherParticle.velocity, theta);

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
    }
}
