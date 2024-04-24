import { Canvas } from "./canvas.js";
import { randomIntFromRange } from "./util.js";
import { config } from "./config.js";

const configCopy = { ...config };
let app;
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
    this.context = null;
    if (!config.headless) {
      this.context = this.grid.getContext("2d");
    }
    this.canvas = new Canvas(this.grid, this.context, this.config);
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
          this.canvas.dimensions.width - this.config.particle_radius
        ),
        randomIntFromRange(
          this.config.particle_radius,
          this.canvas.dimensions.height - this.config.particle_radius
        ),
      ]);
    }

    this.particle_array = particle_array;
  }

  #send_data(data) {
    fetch(
        "/data",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(data)
        }
    );
  }

  /**
   * @title run()
   * @description Runs application. Creates particle array, canvas, and animates canvas.
   */
  async run() {
    if (this.config.experiment_mode) {
      this.config.headless = true;
      const inertia_values = [];
      for (let i = 0.1; i <= 1; i += 0.1) {
        inertia_values.push(i);
      }

      for (let inertia_value of inertia_values) {
        this.config.inertia = inertia_value;
        this.canvas = new Canvas(this.grid, this.context, this.config);
        this.create_particle_array();
        this.canvas.create(this.particle_array);
        const result = await new Promise((resolve) => {
          this.canvas.animate(resolve);
        });

        console.log(
          `Results:
  -- Total steps: ${result.total_steps}
  -- Avg. Distance to Shape: ${result.average_distance_to_shape}
  -- Timed out?: ${result.timeout}`
        );
        this.#send_data(result);

        this.canvas.reset();
        delete this.canvas;
      }
    } else {
      if (!this.config.headless) {
        this.context.clearRect(
          0,
          0,
          this.canvas.dimensions.width,
          this.canvas.dimensions.height
        );
      }

      this.create_particle_array();
      this.canvas.create(this.particle_array);
      const result = await new Promise((resolve) => {
        this.canvas.animate(resolve);
      });
      console.log(result);
    }
  }
}

const handleControlsSubmit = (e) => {
  e.preventDefault();
  app.canvas.reset();
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
  app = new App(configCopy);
  app.run();
};

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("controls")
    .addEventListener("submit", handleControlsSubmit);

  app = new App(configCopy);
  app.run();
});
