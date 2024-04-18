import { Swarm } from './swarm.js';
// import Renderer from './renderer/renderer.js';
import { Canvas } from './canvas.js';
import { randomIntFromRange } from './util.js';
class App {
    constructor() {
        this.box_size = 50;
        this.grid_color = '#262626';
        this.particle_radius = 10;
        this.num_particles = 20;
        this.particle_array = [];

        this.grid = document.getElementById('swarm-grid');
        this.context = this.grid.getContext('2d');

        this.swarm = new Swarm();
        this.canvas = new Canvas(
            this.grid,
            this.context,
            this.box_size,
            this.particle_radius,
            this.grid_color
        );
        // this.renderer = new Renderer(this.grid, 640, 480);
    }

    create_particle_array() {
        let particle_array = [];

        for (let i = 0; i < this.num_particles; i++) {
            particle_array.push([
                this.util.randomIntFromRange(
                    this.particle_radius,
                    this.canvas.canvas_width - this.particle_radius
                ),
                randomIntFromRange(
                    this.particle_radius,
                    this.canvas.canvas_height - this.particle_radius
                ),
            ]);
        }

        this.particle_array = particle_array;
    }

    run() {
        this.create_particle_array();
        this.canvas.create(this.particle_array);
        this.canvas.animate();
    }

    // Create webgl context for particle system
    // create_webgl() {
    // this.renderer.render();
    // }
}

let app = new App();
app.run();
// app.create_webgl();
