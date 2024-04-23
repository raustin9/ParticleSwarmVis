import { Swarm } from './swarm.js';
// import Renderer from './renderer/renderer.js';
import { Canvas } from './canvas.js';
import { randomIntFromRange } from './util.js';
class App {
    /**
     * @title App Constructor
     *
     * @param {number} num_particles The number of particles to generate
     * @param {string} shape Determines shape of convergence
     * @param {number} radius Determines the radius of the shape of convergence
     */
    constructor(num_particles, shape, shape_radius) {
        // grid parameters
        this.box_size = 50;
        this.grid_color = '#262626';

        // particle parameters
        this.particle_array = [];
        this.particle_radius = 1.5;
        // this.num_particles = 1500; // ~1800 seems to be highest that runs smoothly
        this.num_particles = num_particles;
        this.particle_fill = false;
        this.particle_color = 'cyan';

        this.shape = shape;
        this.shape_radius = shape_radius;

        this.grid = document.getElementById('swarm-grid');
        this.context = this.grid.getContext('2d');

        this.swarm = new Swarm();
        this.canvas = new Canvas(
            this.grid,
            this.context,
            this.box_size,
            this.particle_radius,
            this.particle_color,
            this.particle_fill,
            this.grid_color,
            this.shape,
            this.shape_radius
        );
        // this.renderer = new Renderer(this.grid, 640, 480);
    }

    /**
     * @title create_particle_array()
     * @description Creates randomly initialized particle starting locations. Sets class instance particle_array variable with array.
     */
    create_particle_array() {
        let particle_array = [];

        for (let i = 0; i < this.num_particles; i++) {
            particle_array.push([
                randomIntFromRange(
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

    /**
     * @title run()
     * @description Runs application. Creates particle array, canvas, and animates canvas.
     */
    run() {
        this.context.clearRect(0, 0, this.canvas_width, this.canvas_height);

        this.create_particle_array();
        this.canvas.create(this.particle_array);
        this.canvas.animate();
    }

    // Create webgl context for particle system
    // create_webgl() {
    // this.renderer.render();
    // }
}

let app = new App(1500, '', 300);
app.run();

let controls = document.getElementById('controls');

controls.addEventListener('submit', (e) => {
    e.preventDefault();
    let num_particles = document.getElementById('num_particles_value').value;
    let radios = document.getElementsByName('shape');
    let radius = document.getElementById('shape_radius').value;

    let shape = 'square';
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            shape = radios[i].value;
            break;
        }
    }

    console.log(parseInt(num_particles), shape, parseInt(radius));

    // handle submit
    let app = new App(parseInt(num_particles), shape, parseInt(radius));
    app.run();
});

// app.create_webgl();
