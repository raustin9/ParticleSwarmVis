export const config = {
  /**********************
   **   Swarm Config   **
   **********************/

  // Whether or not to render the particles
  headless: false,
  experiment_mode: false,

  // Number of particles
  num_particles: 1500,

  // Percent of particles that must be stopped before the experiment is "done"
  stopped_particles_threshold: 0.99,

  // Whether or not to stop animating
  stop_animating_on_particles_stopped: false,

  // Max steps that can occur before the experiment times out.
  max_steps_before_stopping: 500,

  // Size of box in background grid
  box_size: 50,

  // Grid color
  grid_color: "#262626",

  /**********************
   **   Shape Config   **
   **********************/

  // Shape. must be 'circle' or 'square'
  shape: "circle",

  // Shape color
  shape_color: "blue",

  // Shape radius
  shape_radius: 300,

  /**********************
   ** Particle Config  **
   **********************/

  // Particle radius
  particle_radius: 1.5,

  // Whether or not to fill the particles
  particle_fill: false,

  // Non-shape Particle color
  particle_color: "cyan",

  // Max speed
  max_speed: 5,

  // Range in which particles can detect a shape particle
  scent_range: 500,

  // Range in which particles can detect other particles
  social_range: 50,

  // The factor by which social scent is increased when
  // transmitted between particles
  social_scent_increase_factor: 10,

  // Cognition
  cognition: 10,

  // Social
  social: 0.01,

  // Inertia
  inertia: 1,

  // Particle mass
  mass: 1,

  // Number of times a particle can keep the same p_best_score before resetting
  stagnation_limit: Infinity,

  // Max turning radius of the particle. Set to null to disable turning radius
  max_turning_radius: null,

  // Number of recent positions to track to determine convergence
  recent_positions_capacity: 10,

  // Radius in which recent positions must all fall into
  // in order for the particle to be considered stopped.
  stopping_radius: 30,

  // The fraction of velocity that is preserved on
  // particle collision
  collision_energy_loss_factor: 0.9,

  // The amount that is added to the position correction that occurs when
  // particles collide
  collision_correction_supplement: 0,
};
