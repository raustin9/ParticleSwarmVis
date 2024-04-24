import { rotateVelocities, distance } from "./util.js";

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
   * @param {number} init_xdir Randomly assigned value (1 | -1) to set initial direction in X direction
   * @param {number} init_ydir Randomly assigned value (1 | -1) to set initial direction in Y direction
   * @param {Object} config Configuration for the app's behavior (see config.js)
   */
  constructor(id, xpos, ypos, init_xdir, init_ydir, config) {
    this.id = id;
    this.config = { ...config };
    this.is_shape_particle = this.id === -1;
    this.xpos = xpos;
    this.ypos = ypos;
    this.init_xdir = init_xdir;
    this.init_ydir = init_ydir;
    this.speed = this.is_shape_particle ? 0 : this.config.max_speed;
    this.velocity = {
      x: 1 * this.speed * this.init_xdir,
      y: 1 * this.speed * this.init_ydir,
    };

    this.direction = Math.atan2(this.velocity.y, this.velocity.x);
    this.p_best = { x: xpos, y: ypos };
    this.p_best_score = Infinity;
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
    if (this.config.headless) {
      return;
    }

    context.beginPath();
    context.arc(
      this.xpos,
      this.ypos,
      this.config.particle_radius,
      0,
      2 * Math.PI
    );

    if (this.config.particle_fill) {
      context.fillStyle = this.is_shape_particle
        ? this.config.shape_color
        : this.config.particle_color;
      context.fill();
    } else {
      context.strokeStyle = this.is_shape_particle
        ? this.config.shape_color
        : this.config.particle_color;
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
    if (this.recent_positions.length < this.config.recent_positions_capacity) {
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

    return max_distance <= this.config.stopping_radius ? 1 : 0;
  }

  /**
   * @title update(context, particles)
   * @description Updates particle motion accounting for canvas boundaries and collisions
   *
   * @param {CanvasRenderingContext2D} context Context of canvas element
   * @param {Particle[]} particles Array containing of rendered particles
   */
  update(context, particles) {
    let bad_before = true;
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
    if (this.is_shape_particle) {
      return;
    }

    this.xpos += this.velocity.x;
    this.ypos += this.velocity.y;

    // Wall collision checks
    if (this.xpos + this.config.particle_radius >= context.canvas.width) {
      this.xpos = context.canvas.width - this.config.particle_radius;
      this.velocity.x *= -1;
    } else if (this.xpos - this.config.particle_radius <= 0) {
      this.xpos = this.config.particle_radius;
      this.velocity.x *= -1;
    }

    if (this.ypos + this.config.particle_radius >= context.canvas.height) {
      this.ypos = context.canvas.height - this.config.particle_radius;
      this.velocity.y *= -1;
    } else if (this.ypos - this.config.particle_radius <= 0) {
      this.ypos = this.config.particle_radius;
      this.velocity.y *= -1;
    }

    for (let i = 0; i < particles.length; i++) {
      const other_particle = particles[i];
      if (this.id === other_particle.id) continue;

      const distance_to_particle = distance(
        this.xpos,
        this.ypos,
        other_particle.xpos,
        other_particle.ypos
      );

      // Process distance from shape particle
      if (other_particle.is_shape_particle) {
        min_distance_to_shape = Math.min(
          distance_to_particle,
          min_distance_to_shape
        );

        if (
          distance_to_particle <= this.config.scent_range &&
          distance_to_particle < smallest_scent_score
        ) {
          smallest_scent_score = distance_to_particle;
          smallest_scent = {
            x: other_particle.xpos,
            y: other_particle.ypos,
          };
        }
        continue;
      }
      if (distance_to_particle - this.config.particle_radius * 2 < 0) {
        const res = {
          x: this.velocity.x - other_particle.velocity.x,
          y: this.velocity.y - other_particle.velocity.y,
        };

        if (
          res.x * (other_particle.xpos - this.xpos) +
            res.y * (other_particle.ypos - this.ypos) >=
          0
        ) {
          const m1 = this.config.mass;
          const m2 = other_particle.config.mass;
          const theta = -Math.atan2(
            other_particle.ypos - this.ypos,
            other_particle.xpos - this.xpos
          );

          // Reposition particles to maintain minimum distance
          const overlap =
            this.config.particle_radius * 2 - distance_to_particle;
          const correction_factor = overlap / (distance_to_particle || 1) / 2;
          const correction_x =
            correction_factor * (this.xpos - other_particle.xpos);
          const correction_y =
            correction_factor * (this.ypos - other_particle.ypos);

          const collison_correction_supplement_x =
            (correction_x > 0 ? 1 : -1) *
            this.config.collision_correction_supplement;
          const collison_correction_supplement_y =
            (correction_y > 0 ? 1 : -1) *
            this.config.collision_correction_supplement;

          this.xpos += correction_x + collison_correction_supplement_x;
          this.ypos += correction_y + collison_correction_supplement_y;
          other_particle.xpos -= correction_x + correction_x > 0 ? 1 : -1;
          other_particle.ypos -= correction_y + correction_y > 0 ? 1 : -1;

          // Recalculate velocities with energy loss on collision
          const rotated_velocity1 = rotateVelocities(this.velocity, theta);
          const rotated_velocity2 = rotateVelocities(
            other_particle.velocity,
            theta
          );

          const swap_velocity1 = {
            x:
              ((rotated_velocity1.x * (m1 - m2) +
                rotated_velocity2.x * 2 * m2) /
                (m1 + m2)) *
              this.config.collision_energy_loss_factor,
            y: rotated_velocity1.y * this.config.collision_energy_loss_factor,
          };
          const swap_velocity2 = {
            x:
              ((rotated_velocity2.x * (m1 - m2) +
                rotated_velocity1.x * 2 * m1) /
                (m1 + m2)) *
              this.config.collision_energy_loss_factor,
            y: rotated_velocity2.y * this.config.collision_energy_loss_factor,
          };

          const u1 = rotateVelocities(swap_velocity1, -theta);
          const u2 = rotateVelocities(swap_velocity2, -theta);

          this.velocity.x = u1.x;
          this.velocity.y = u1.y;
          other_particle.velocity.x = u2.x;
          other_particle.velocity.y = u2.y;
        }
        continue;
      }

      const nearby_social_scent =
        other_particle.p_best_score * this.config.social_scent_increase_factor;
      if (
        distance_to_particle < this.config.social_range &&
        nearby_social_scent < smallest_social_scent_score
      ) {
        smallest_social_scent_score = nearby_social_scent;
        smallest_social_scent = {
          x: other_particle.xpos,
          y: other_particle.ypos,
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
        this.config.cognition * Math.random() * (this.p_best.x - this.xpos);
      let cognitive_component_y =
        this.config.cognition * Math.random() * (this.p_best.y - this.ypos);
      let social_component_x =
        this.config.social * Math.random() * (g_best.x - this.xpos);
      let social_component_y =
        this.config.social * Math.random() * (g_best.y - this.ypos);

      let desired_velocity_x =
        this.velocity.x * this.config.inertia +
        cognitive_component_x +
        social_component_x;
      let desired_velocity_y =
        this.velocity.y * this.config.inertia +
        cognitive_component_y +
        social_component_y;

      if (this.config.max_turning_radius !== null) {
        let turning_radius_radians =
          (Math.PI * this.config.max_turning_radius) / 180;
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
        current_speed = Math.min(current_speed, this.config.max_speed);
        this.velocity.x =
          Math.cos(current_angle + angle_difference) * current_speed;
        this.velocity.y =
          Math.sin(current_angle + angle_difference) * current_speed;
      } else {
        let speed = Math.sqrt(
          desired_velocity_x ** 2 + desired_velocity_y ** 2
        );
        if (speed > this.config.max_speed) {
          desired_velocity_x =
            (desired_velocity_x / speed) * this.config.max_speed;
          desired_velocity_y =
            (desired_velocity_y / speed) * this.config.max_speed;
        }
        this.velocity.x = desired_velocity_x;
        this.velocity.y = desired_velocity_y;
      }
    }

    if (this.stagnation_counter > this.config.stagnation_limit) {
      this.reset_p_best();
    }

    if (this.recent_positions.length >= this.config.recent_positions_capacity) {
      this.recent_positions.shift();
    }

    this.recent_positions.push({ x: this.xpos, y: this.ypos });
    this.has_stopped = this.check_stopped();
    if (!bad_before && (isNaN(this.xpos) || isNaN(this.ypos))) {
      console.log("this");
    }
    return {
      min_distance_to_shape: min_distance_to_shape,
      has_stopped: this.has_stopped,
    };
  }
}
