import { Particle } from "./particle.js";
import { randomIntFromRange, distance, thresholdCompare } from "./util.js";

export class Canvas {
  /**
   * @title Canvas Constructor
   *
   * @param {elementId} grid Grid element
   * @param {CanvasRenderingContext2D} context Context of canvas element
   * @param {Object} config Configuration for the app's behavior (see config.js)
   */
  constructor(grid, context, config) {
    this.grid = grid;
    this.context = context;
    this.config = { ...config };
    this.dimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    if (!this.config.headless) {
      this.context.canvas.width = this.dimensions.width;
      this.context.canvas.height = this.dimensions.height;
    }

    this.grid_color = this.config.grid_color;

    this.box_size = this.config.box_size;
    this.particle_radius = this.config.particle_radius;
    this.particle_fill = this.config.particle_fill;
    this.particle_color = this.config.particle_color;
    this.particles = [];

    this.shape = this.config.shape;
    this.shape_radius = this.config.shape_radius;

    this.total_steps = 0;
    this.num_regular_particles = 0;
    this.is_converged = false;
    this.has_stopped = false;
  }

  /**
   * @title create(particle_array)
   * @description Creates grid and particles within the canvas element
   *
   * @param {Particle[]} particle_array Array containing list of created particles
   */
  create(particle_array) {
    this.num_regular_particles = particle_array.length;
    if (!this.config.headless) {
      this.create_grid(this.grid_color);
    }

    if (this.shape == "circle") this.create_circle(this.shape_radius);
    if (this.shape == "square") this.create_square(this.shape_radius);
    this.create_particles(particle_array);
  }

  /**
   * @title create_grid(color)
   * @description Create background grid on canvas
   *
   * @param {string} color Hex code for grid line color
   */
  create_grid(color) {
    if (this.config.headless) {
      return;
    }

    // get number of boxes per axis
    const num_boxes_x = this.dimensions.width / this.box_size;
    const num_boxes_y = this.dimensions.height / this.box_size;

    // make boxes split evenly on both sides when not perfectly divisible
    const x_shift =
      ((num_boxes_x - Math.floor(num_boxes_x)) / 2) * this.box_size;
    const y_shift =
      ((num_boxes_y - Math.floor(num_boxes_y)) / 2) * this.box_size;

    // horizontal lines
    for (let i = 1; i < num_boxes_x; i++) {
      this.context.beginPath();
      this.context.moveTo(x_shift + i * this.box_size, 0);
      this.context.lineTo(x_shift + i * this.box_size, this.dimensions.height);
      this.context.strokeStyle = color;

      this.context.stroke();
      this.context.closePath();
    }

    // vertical lines
    for (let i = 1; i < num_boxes_y; i++) {
      this.context.beginPath();
      this.context.moveTo(0, y_shift + i * this.box_size);
      this.context.lineTo(this.dimensions.width, y_shift + i * this.box_size);
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
            distance(
              xpos,
              ypos,
              this.particles[j].xpos,
              this.particles[j].ypos
            ) -
              this.particle_radius * 2 <
            0
          ) {
            xpos = randomIntFromRange(
              this.particle_radius,
              this.dimensions.width - this.particle_radius
            );
            ypos = randomIntFromRange(
              this.particle_radius,
              this.dimensions.height - this.particle_radius
            );

            j = -1;
          }
        }
      }

      let particle = new Particle(
        i,
        xpos,
        ypos,
        xdir,
        ydir,
        this.config,
        this.dimensions
      );
      particle.draw(this.context);
      this.particles.push(particle);
    }
  }

  /**
   * @title create_square(radius)
   * @description Create a square of particles for other particles to target
   *
   * @param {number} radius The number of pixels wide the square is
   */
  create_square(radius) {
    let center = {
      x: this.dimensions.width / 2,
      y: this.dimensions.height / 2,
    };

    let corners = {
      top_left: [center.x - radius, center.y - radius],
      top_right: [center.x + radius, center.y - radius],
      bottom_left: [center.x - radius, center.y + radius],
      bottom_right: [center.x + radius, center.y + radius],
    };

    // top and bottom line
    for (
      let i = corners.top_left[0];
      i < corners.top_right[0] + this.particle_radius;
      i += this.particle_radius * 2
    ) {
      // top line
      let top = new Particle(
        -1,
        i,
        corners.top_left[1],
        0,
        0,
        this.config,
        this.dimensions
      );
      top.draw(this.context);
      this.particles.push(top);

      // bottom line
      let bottom = new Particle(
        -1,
        i,
        corners.bottom_left[1],
        0,
        0,
        this.config,
        this.dimensions
      );
      bottom.draw(this.context);
      this.particles.push(bottom);
    }

    // left and right line
    for (
      let i = corners.top_left[1] + this.particle_radius * 2;
      i < corners.bottom_left[1];
      i += this.particle_radius * 2
    ) {
      // left line
      let left = new Particle(
        -1,
        corners.top_left[0],
        i,
        0,
        0,
        this.config,
        this.dimensions
      );
      left.draw(this.context);
      this.particles.push(left);

      // right line
      let right = new Particle(
        -1,
        corners.top_right[0],
        i,
        0,
        0,
        this.config,
        this.dimensions
      );
      right.draw(this.context);
      this.particles.push(right);
    }
  }

  create_circle(radius) {
    let center = {
      x: this.dimensions.width / 2,
      y: this.dimensions.height / 2,
    };

    let circumference = 2 * Math.PI * radius;
    let num_circles = circumference / (2 * this.particle_radius);

    for (let i = 0; i < 185; i += 360 / num_circles) {
      let x = center.x + radius * Math.cos(i);
      let y = center.y + radius * Math.sin(i);

      let particle = new Particle(-1, x, y, 0, 0, this.config, this.dimensions);
      particle.draw(this.context);
      this.particles.push(particle);
    }
  }

  /**
   * @title calculate_mean_error()
   * @description find the mean error for all particles from the
   *              shape
   */
  calculate_mean_error() {
    let i = 0;
    let total = 0;
    for (; i < this.particles.length; i++) {
      total += this.particles[i].best_distance_to_wall;
      // console.log(this.particles[i].best_distance_to_wall);
    }
    return total / this.particles.length;
  }

  /**
   * @title check_convergence()
   * @description determine if we are converged
   *              we are converged  if the previous error is within a certain
   *              threshold of the previous one for a certaine number of steps
   */
  check_convergence() {
    let i, num_stagnated;

    for (i = 0, num_stagnated = 0; i < this.particles.length; i++) {
      if (this.particles[i].stagnation_counter > 500) {
        // console.log(`stag_count: ${this.particles[i].stagnation_counter}`);
        num_stagnated++;
      }
    }
    return num_stagnated > this.particles.length * 0.9;
  }

  /*
   * @title reset()
   * @description Reset the context of the canvas
   */
  reset() {
    delete this.particles;
    this.context.reset();
  }

  /**
   * @title animate()
   * @description Animate particles
   */
  animate(particles_stopped_callback) {
    this.total_steps++;
    document.getElementById("steps-count").textContent =
      this.total_steps.toString();
    if (!this.particles) {
      return;
    }

    // this.prev_mean_error = this.current_mean_error;

    if (
      !(this.has_stopped && this.config.stop_animating_on_particles_stopped)
    ) {
      requestAnimationFrame(() => this.animate(particles_stopped_callback));
    }
    if (!this.headless) {
      this.context.clearRect(
        0,
        0,
        this.dimensions.width,
        this.dimensions.height
      );
    }
    this.create_grid(this.grid_color);

    let stopped_count = 0;
    let total_distance_to_shape = 0;

    // Normal for loop is faster than forEach
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      const particle_diagnostic = particle.update(this.context, this.particles);
      if (particle.id == -1) {
        continue;
      }
      stopped_count += particle_diagnostic.has_stopped;

      total_distance_to_shape += particle_diagnostic.min_distance_to_shape;
    }

    let average_distance_to_shape =
      total_distance_to_shape / this.num_regular_particles;

    // if (!this.is_converged && this.check_convergence()) {
    //   console.log(`Converged in ${this.total_steps} steps.`);
    //   this.is_converged = true;
    // }

    const step_threshold_exceeded =
      this.total_steps >= this.config.max_steps_before_stopping;

    this.has_stopped =
      stopped_count >=
        this.config.stopped_particles_threshold * this.num_regular_particles ||
      step_threshold_exceeded;

    if (this.has_stopped) {
      particles_stopped_callback({
        total_steps: this.total_steps,
        average_distance_to_shape: average_distance_to_shape,
        timeout: step_threshold_exceeded,
      });
    }
  }
}
