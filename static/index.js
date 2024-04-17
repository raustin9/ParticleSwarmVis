import { Swarm } from './swarm.js';
import Renderer from './renderer/renderer.js';

class Particle {
    constructor(xpos, ypos, radius, color) {
        this.xpos = xpos;
        this.ypos = ypos;
        this.radius = radius;
        this.color = color;
    }

    draw(context) {
        context.beginPath();
        context.arc(this.xpos, this.ypos, this.radius, 0, 2 * Math.PI);
        context.fillStyle = this.color;
        context.fill();
        context.closePath();
    }
}
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

        // this.grid_data = Array(numx)
        //     .fill()
        //     .map(() => Array(numy).fill(0));

        // for (let i = 0; i < this.grid_data.length; i++) {
        //     for (let j = 0; j <= this.grid_data.length; j++) {
        //         this.grid_data[i][j] = Math.floor(Math.random() * 4);
        //     }
        // }

        this.box_size = box_size;
        this.point_radius = point_radius;
    }

    // Create 2D grid on canvas
    create_grid() {
        // for (let i = 0; i < this.grid_data.length; i++) {
        //     for (let j = 0; j <= this.grid_data.length; j++) {
        //         this.context.beginPath();
        //         this.context.rect(
        //             i * this.box_size,
        //             j * this.box_size,
        //             this.box_size,
        //             this.box_size
        //         );
        //         this.context.strokeStyle = '#363636';
        //         this.context.fillStyle = 'cyan';
        //         if (this.grid_data[i][j] === 3) {
        //             this.context.fill();
        //         } else {
        //         }
        //         this.context.stroke();
        //     }
        // }

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
            this.context.strokeStyle = 'white';

            this.context.stroke();
        }

        // vertical lines
        for (let i = 1; i < num_boxes_y; i++) {
            this.context.beginPath();
            this.context.moveTo(0, y_shift + i * this.box_size);
            this.context.lineTo(this.canvas_width, y_shift + i * this.box_size);
            this.context.strokeStyle = 'white';

            this.context.stroke();
        }
    }

    create_particles() {
        let particle = new Particle(this.width / 2, this.height / 2, this.radius, 'cyan');
        particle.draw(this.context);
    }

    // Create webgl context for particle system
    // create_webgl() {
    // this.renderer.render();
    // }
}

let app = new App(40, 40);
app.create_grid();
app.create_particles();
// app.create_webgl();
