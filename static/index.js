import { Swarm } from './swarm.js';
import Renderer from './renderer/renderer.js';
import { Particle } from './particle.js';
class App {
    constructor(box_size, point_radius) {
        this.swarm = new Swarm();

        this.grid = document.getElementById('swarm-grid');
        this.context = this.grid.getContext('2d');

        this.canvas_width = this.context.canvas.width;
        this.canvas_height = this.context.canvas.height;

        // this.renderer = new Renderer(this.grid, 640, 480);

        this.box_size = box_size;
        this.point_radius = point_radius;
        this.particles = [];
    }

    // Create background grid on canvas
    create_grid(color) {
        // get number of boxes per axis
        const num_boxes_x = this.canvas_width / this.box_size;
        const num_boxes_y = this.canvas_height / this.box_size;

        // make boxes split evenly on both sides when not perfectly divisible
        const x_shift = ((num_boxes_x - Math.floor(num_boxes_x)) / 2) * this.box_size;
        const y_shift = ((num_boxes_y - Math.floor(num_boxes_y)) / 2) * this.box_size;

        // horizontal lines
        for (let i = 1; i < num_boxes_x; i++) {
            this.context.beginPath();
            this.context.moveTo(x_shift + i * this.box_size, 0);
            this.context.lineTo(x_shift + i * this.box_size, this.canvas_height);
            this.context.strokeStyle = color;

            this.context.stroke();
            this.context.closePath();
        }

        // vertical lines
        for (let i = 1; i < num_boxes_y; i++) {
            this.context.beginPath();
            this.context.moveTo(0, y_shift + i * this.box_size);
            this.context.lineTo(this.canvas_width, y_shift + i * this.box_size);
            this.context.strokeStyle = color;

            this.context.stroke();
            this.context.closePath();
        }
    }

    distance(x1, y1, x2, y2) {
        const xDist = x2 - x1;
        const yDist = y2 - y1;

        return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
    }

    randomIntFromRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    create_particles(particle_array) {
        for (let i = 0; i < particle_array.length; i++) {
            let xpos = particle_array[i][0];
            let ypos = particle_array[i][1];

            let xdir = 1;
            let ydir = 1;
            if (Math.random() < 0.5) {
                xdir = -1;
            }
            if (Math.random() < 0.5) {
                ydir = -1;
            }

            // regenerate random particle location if particles overlap
            if (i !== 0) {
                for (let j = 0; j < this.particles.length; j++) {
                    if (
                        this.distance(xpos, ypos, this.particles[j].xpos, this.particles[j].ypos) -
                            this.point_radius * 2 <
                        0
                    ) {
                        xpos = this.randomIntFromRange(
                            this.point_radius,
                            this.canvas_width - this.point_radius
                        );
                        ypos = this.randomIntFromRange(
                            this.point_radius,
                            this.canvas_height - this.point_radius
                        );

                        j = -1;
                    }
                }
            }

            let particle = new Particle(xpos, ypos, this.point_radius, 5, 'cyan', xdir, ydir);
            particle.draw(this.context);
            this.particles.push(particle);
        }
    }

    updateParticles = () => {
        requestAnimationFrame(this.updateParticles);

        this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);

        this.create_grid('#262626');
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update(this.context);
        }
    };

    // Create webgl context for particle system
    // create_webgl() {
    // this.renderer.render();
    // }
}

const box_size = 50;
const grid_color = '#262626';
const particle_radius = 10;
const num_particles = 20;

let app = new App(box_size, particle_radius);
app.create_grid(grid_color);

let particle_array = [];
for (let i = 0; i < num_particles; i++) {
    particle_array.push([
        app.randomIntFromRange(particle_radius, app.canvas_width - particle_radius),
        app.randomIntFromRange(particle_radius, app.canvas_height - particle_radius),
    ]);
}

app.create_particles(particle_array);
app.updateParticles();

// app.create_webgl();
