import { Canvas } from "./canvas.js";
import { randomIntFromRange } from "./util.js";
import { config } from "./config.js";

const configCopy = { ...config };

class App {
  /**
   * @title App Constructor
   *
   * @param {Object} config Configuration for the app's behavior (see config.js)
   */
  constructor(config) {
    // particle parameters
    this.particle_array = [];
    this.config = config;
    this.grid = document.getElementById("swarm-grid");
    this.context = this.grid.getContext("2d");
    this.canvas = new Canvas(this.grid, this.context, this.config);

    this.controls = document.getElementById("controls");
    this.controls.addEventListener("submit", (e) => {
      e.preventDefault();
      this.canvas.reset();
      let num_particles = document.getElementById("num_particles_value").value;
      let radios = document.getElementsByName("shape");
      let radius = document.getElementById("shape_radius").value;

      let shape = "";
      for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
          shape = radios[i].value;
          break;
        }
      }

      console.log(parseInt(num_particles), shape, parseInt(radius));

      configCopy.num_particles = parseInt(num_particles);
      configCopy.shape = shape;
      configCopy.shape_radius = parseInt(radius);

      // handle submit
      let app = new App(configCopy);
      app.run();
    });
  }

  /**
   * @title create_particle_array()
   * @description Creates randomly initialized particle starting locations. Sets class instance particle_array variable with array.
   */
  create_particle_array() {
    let particle_array = [];

    for (let i = 0; i < this.config.num_particles; i++) {
      particle_array.push([
        randomIntFromRange(
          this.config.particle_radius,
          this.canvas.canvas_width - this.config.particle_radius
        ),
        randomIntFromRange(
          this.config.particle_radius,
          this.canvas.canvas_height - this.config.particle_radius
        ),
      ]);
    }

    this.particle_array = particle_array;
  }

  /**
   * @title run()
   * @description Runs application. Creates particle array, canvas, and animates canvas.
   */
  async run() {
    this.context.clearRect(0, 0, this.canvas_width, this.canvas_height);

    this.create_particle_array();
    this.canvas.create(this.particle_array);
    const result = await new Promise((resolve) => {
      this.canvas.animate(resolve);
    });
    console.log(result);
  }
}

let app = new App(configCopy);
app.run();
