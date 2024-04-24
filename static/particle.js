import { rotateVelocities, distance } from "./util.js";

const MAX_SPEED = 5;
const SCENT_RANGE = 100;
const SOCIAL_RANGE = 50;
const SOCIAL_SCENT_INCREASE_FACTOR = 10;
const SCENT_REDUCTION_FACTOR = 10;
const COGNITION = 3;
const SOCIAL = 0.1;
const STAGNATION_LIMIT = Infinity;
const INERTIA = 1;
const MAX_TURNING_RADIUS = null; // Degrees. Set to null to turn off turning radius.
const RECENT_POSITIONS_CAPACITY = 10;
const STOPPING_RADIUS = 30;

let g_best = {
  x: 0,
  y: 0,
};

let g_best_score = Infinity;
export class Particle {
  /**
   * @title Particle Constructor
   *
   * @param {number} id Particle ID
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
  constructor(
    id,
    xpos,
    ypos,
    radius,
    speed,
    color,
    fill,
    init_xdir,
    init_ydir
  ) {
    this.id = id;
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
    this.direction = Math.atan2(this.velocity.y, this.velocity.x);
    this.mass = 1;
    this.p_best = { x: xpos, y: ypos };
    this.p_best_score = Infinity;
    this.scent_range = SCENT_RANGE;
    this.social_range = SOCIAL_RANGE;
    this.social_scent_increase_factor = SOCIAL_SCENT_INCREASE_FACTOR;
    this.scent_reduction_factor = SCENT_REDUCTION_FACTOR;
    this.cognition = COGNITION;
    this.social = SOCIAL;
    this.stagnation_limit = STAGNATION_LIMIT;
    this.inertia = INERTIA;
    this.stagnation_counter = 0;
    this.recent_positions = [];
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

    if (this.fill) {
      context.fillStyle = this.color;
      context.fill();
    } else {
      context.strokeStyle = this.color;
      context.stroke();
    }

    context.closePath();
  }

  reset_p_best() {
    // Reset pBest to current position or another strategy
    this.p_best = { x: this.xpos, y: this.ypos };
    this.p_best_score = Infinity; // Reset score
    this.stagnation_counter = 0; // Reset stagnation counter
  }

  check_stopped() {
    if (this.recent_positions.length < RECENT_POSITIONS_CAPACITY) {
      return 0;
    }

    let max_distance = 0;
    for (let i = 0; i < this.recent_positions.length; i++) {
      for (let j = i + 1; j < this.recent_positions.length; j++) {
        let current_distance = distance(
          this.recent_positions[i].x,
          this.recent_positions[i].y,
          this.recent_positions[j].x,
          this.recent_positions[j].y
        );
        if (current_distance > max_distance) {
          max_distance = current_distance;
        }
      }
    }

    return max_distance <= STOPPING_RADIUS ? 1 : 0;
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
    let smallest_scent_score = Infinity;
    let smallest_scent = {
      x: 0,
      y: 0,
    };
    let smallest_social_scent_score = Infinity;
    let smallest_social_scent = {
      x: 0,
      y: 0,
    };
    let min_distance_to_shape = Infinity;

    // check for collisions
    if (this.id === -1) {
      return;
    }

    for (let i = 0; i < particles.length; i++) {
      const otherParticle = particles[i];
      if (this.id === -1) {
        continue;
      }
      if (this.id === otherParticle.id) continue;

      const distance_to_particle = distance(
        this.xpos,
        this.ypos,
        otherParticle.xpos,
        otherParticle.ypos
      );
      min_distance_to_shape = Math.min(
        distance_to_particle,
        min_distance_to_shape
      );

      // Process distance from shape particle
      if (otherParticle.id === -1) {
        if (
          distance_to_particle <= this.scent_range &&
          distance_to_particle < smallest_scent_score
        ) {
          smallest_scent_score = distance_to_particle;
          smallest_scent = {
            x: otherParticle.xpos,
            y: otherParticle.ypos,
          };
        }
        continue;
      }

      if (distance_to_particle - this.radius * 2 < 0) {
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
          const rotatedVelocity2 = rotateVelocities(
            otherParticle.velocity,
            theta
          );

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
        continue;
      }

      const nearby_social_scent =
        otherParticle.p_best_score * this.social_scent_increase_factor;
      if (
        distance_to_particle < this.social_range &&
        nearby_social_scent < smallest_social_scent_score
      ) {
        smallest_social_scent_score = nearby_social_scent;
        smallest_social_scent = {
          x: otherParticle.xpos,
          y: otherParticle.ypos,
        };
      }
    }

    const best_scent_score = Math.min(
      smallest_scent_score,
      smallest_social_scent_score
    );

    if (best_scent_score != Infinity && best_scent_score < this.p_best_score) {
      const best_scent =
        best_scent_score == smallest_scent_score
          ? smallest_scent
          : smallest_social_scent;
      this.p_best_score = best_scent_score;
      this.p_best = best_scent;
      this.stagnation_counter = 0;
    } else {
      this.stagnation_counter += 1;
    }

    if (this.p_best_score < g_best_score) {
      g_best_score = this.p_best_score;
      g_best = {
        x: this.xpos,
        y: this.ypos,
      };
    }

    if (isFinite(this.p_best_score) && isFinite(g_best_score)) {
      let cognitive_component_x =
        this.cognition * Math.random() * (this.p_best.x - this.xpos);
      let cognitive_component_y =
        this.cognition * Math.random() * (this.p_best.y - this.ypos);
      let social_component_x =
        this.social * Math.random() * (g_best.x - this.xpos);
      let social_component_y =
        this.social * Math.random() * (g_best.y - this.ypos);

      let desired_velocity_x =
        this.velocity.x * this.inertia +
        cognitive_component_x +
        social_component_x;
      let desired_velocity_y =
        this.velocity.y * this.inertia +
        cognitive_component_y +
        social_component_y;

      if (MAX_TURNING_RADIUS !== null) {
        let turning_radius_radians = (Math.PI * MAX_TURNING_RADIUS) / 180;
        let current_angle = Math.atan2(this.velocity.y, this.velocity.x);
        let desired_angle = Math.atan2(desired_velocity_y, desired_velocity_x);
        let angle_difference = desired_angle - current_angle;
        angle_difference =
          ((angle_difference + Math.PI) % (2 * Math.PI)) - Math.PI;
        angle_difference = Math.max(
          Math.min(angle_difference, turning_radius_radians),
          -turning_radius_radians
        );

        let current_speed = Math.sqrt(
          desired_velocity_x ** 2 + desired_velocity_y ** 2
        );
        current_speed = Math.min(current_speed, MAX_SPEED);
        this.velocity.x =
          Math.cos(current_angle + angle_difference) * current_speed;
        this.velocity.y =
          Math.sin(current_angle + angle_difference) * current_speed;
      } else {
        let speed = Math.sqrt(
          desired_velocity_x ** 2 + desired_velocity_y ** 2
        );
        if (speed > MAX_SPEED) {
          desired_velocity_x = (desired_velocity_x / speed) * MAX_SPEED;
          desired_velocity_y = (desired_velocity_y / speed) * MAX_SPEED;
        }
        this.velocity.x = desired_velocity_x;
        this.velocity.y = desired_velocity_y;
      }
    }

    this.xpos += this.velocity.x;
    this.ypos += this.velocity.y;

    // Wall collision checks
    if (this.xpos + this.radius >= context.canvas.width) {
      this.xpos = context.canvas.width - this.radius;
      this.velocity.x *= -1;
    } else if (this.xpos - this.radius <= 0) {
      this.xpos = this.radius;
      this.velocity.x *= -1;
    }

    if (this.ypos + this.radius >= context.canvas.height) {
      this.ypos = context.canvas.height - this.radius;
      this.velocity.y *= -1;
    } else if (this.ypos - this.radius <= 0) {
      this.ypos = this.radius;
      this.velocity.y *= -1;
    }

    if (this.stagnation_counter > this.stagnation_limit) {
      this.reset_p_best();
    }

    if (this.recent_positions.length >= RECENT_POSITIONS_CAPACITY) {
      this.recent_positions.shift();
    }

    this.recent_positions.push({ x: this.xpos, y: this.ypos });
    this.has_stopped = this.check_stopped();
    return {
      min_distance_to_shape: min_distance_to_shape,
      has_stopped: this.has_stopped,
    };
  }
}
