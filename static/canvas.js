import { Particle } from './particle.js';
import { randomIntFromRange, distance } from './util.js';

export class Canvas {
    /**
     * @title Canvas Constructor
     *
     * @param {elementId} grid Grid element
     * @param {CanvasRenderingContext2D} context Context of canvas element
     * @param {number} box_size Size of grid boxes for canvas background
     * @param {number} particle_radius Size of particles
     * @param {string} particle_color Color of particles
     * @param {boolean} particle_fill If the particles are filled or outlines
     * @param {string} grid_color Hex code for grid line color
     */
    constructor(
        grid,
        context,
        box_size,
        particle_radius,
        particle_color,
        particle_fill,
        grid_color
    ) {
        this.grid = grid;
        this.context = context;

        this.canvas_width = this.context.canvas.width;
        this.canvas_height = this.context.canvas.height;
        this.grid_color = grid_color;

        this.box_size = box_size;
        this.particle_radius = particle_radius;
        this.particle_fill = particle_fill;
        this.particle_color = particle_color;
        this.particles = [];
    }

    /**
     * @title create(particle_array)
     * @description Creates grid and particles within the canvas element
     *
     * @param {Particle[]} particle_array Array containing list of created particles
     */
    create(particle_array) {
        this.create_grid(this.grid_color);
        this.create_particles(particle_array);
    }

    /**
     * @title create_grid(color)
     * @description Create background grid on canvas
     *
     * @param {string} color Hex code for grid line color
     */
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

    /**
     * @title create_particles(particle_array)
     * @description Creates particles based on particle array.
     *
     * @param {Particle[]} particle_array Array containing of rendered particles
     */
    create_particles(particle_array) {
        for (let i = 0; i < particle_array.length; i++) {
            let xpos = particle_array[i][0];
            let ypos = particle_array[i][1];

            let xdir = 1;
            let ydir = 1;
            if (Math.random() < 0.5) xdir = -1;
            if (Math.random() < 0.5) ydir = -1;

            // regenerate random particle location if particles overlap
            if (i !== 0) {
                for (let j = 0; j < this.particles.length; j++) {
                    if (
                        distance(xpos, ypos, this.particles[j].xpos, this.particles[j].ypos) -
                            this.particle_radius * 2 <
                        0
                    ) {
                        xpos = randomIntFromRange(
                            this.particle_radius,
                            this.canvas_width - this.particle_radius
                        );
                        ypos = randomIntFromRange(
                            this.particle_radius,
                            this.canvas_height - this.particle_radius
                        );

                        j = -1;
                    }
                }
            }

            let particle = new Particle(
                xpos,
                ypos,
                this.particle_radius,
                5,
                this.particle_color,
                this.particle_fill,
                xdir,
                ydir
            );
            particle.draw(this.context);
            this.particles.push(particle);
        }
    }

    /**
     * @title animate()
     * @description Animate particles
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        this.context.clearRect(0, 0, this.canvas_width, this.canvas_height);
        this.create_grid(this.grid_color);

        this.particles.forEach((particle) => {
            particle.update(this.context, this.particles);
        });
    }
}
