import { Swarm } from './swarm.js';
import Renderer from './renderer/renderer.js';
import { Particle } from './particle.js';
class App {
    constructor(box_size, point_radius) {
        this.swarm = new Swarm();

        this.grid = document.getElementById('swarm-grid');
        this.context = this.grid.getContext('2d');

        // this.grid.style.width = '100%';
        // this.grid.style.height = '100%';
        // this.grid.width = this.grid.offsetWidth;
        // this.grid.height = this.grid.offsetHeight;

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

            let particle = new Particle(xpos, ypos, this.point_radius, 5, 'cyan', xdir, ydir);
            particle.draw(this.context);
            this.particles.push(particle);
        }
    }

    updateCircle = () => {
        requestAnimationFrame(this.updateCircle);

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

let app = new App(50, 10);
app.create_grid('#262626');

let particle_array = [
    [100, 100],
    [550, 300],
];

app.create_particles(particle_array);
app.updateCircle(app.particles[0]);
// app.particles[0].update(app.context);

// app.create_webgl();
