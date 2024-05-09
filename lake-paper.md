## Abstract

Particle Swarm Optimization (PSO) is a biologically-inspired computation technique used to optimize a problem by iteratively trying to improve a candidate solution in relation to an established measure of quality. This technique is based off of swarming patterns found phenomena such as schools of fish or bird murmuration. In this project, we sought to answer the question of whether or not PSO can be effectively used to generate 2-dimensional shapes from particles. This involved implementation of baseline particle movement rules, such as velocity, turning radius, inertia, and collision. Then, PSO behavior was built on top of this baseline in order to simulate natural particle movement and swarming. We created a system in which the particles track a personal best scent and global best scent and applied these values to the standard PSO equation, including a social weight, cognition weight, and an inertia weight. Experimental data was produced by varying each relevant parameter in isolation and then measuring the average distance to the shape across all particles upon convergence. Our results indicated that a higher ratio of the cognition weight the social weight leads to a better overall solution with a lower average distance to shape. This aligns well with the nature of PSO, as a higher social relative social weight would normally cause the particles to pay more attention to one another rather than the shape, leading to a higher average distance to shape. These results answered our research question by establishing that complex 2-dimensional shapes can be created using PSO when a higher emphasis is placed on the cognition weight.

## Introduction and Motivation

In the movie _Finding Nemo_, there is a scene in which the protagonists encounter a school of fish that communicate with the protagonists by organizing themselves into complex, 2-dimensional shapes such as an arrow, a face, and a pirate ship. While there are obvious cartoon elements of this scene, our team was interested to test its validity by formulating it into a Particle Swarm Optimization (PSO) problem. Our goal was to create a 2-dimensional particle particule simulation where particles move around and target locations based on PSO-based agent communication.

Our interest in simulating this particular scene arised from general fascination with swarming patterns found in Biology. As a group, we have always been fascinated with behaviors such as bird murmuration and migration patters, insect swarming, schools of fish, and more. Because of this, using PSO to test the validity of a fictional scene is a fascinating project that allows us to both explore our interest in the subject as well as develop a PSO solution that could be used for a variety of applications.

## Method

### Environment Setup

For this experiment, we developed our environment using a simple Go server as a foundation. This server serves the static HTML, CSS, and JavaScript files we used to build our simulation. Along with this, the server is set up as an API to receive experimental data from the JavaScript simulation to append to a CSV file. This simple environment allows the simulation to be easily rendered in any browser while also being compatible with the generation of simple experimental data. We did not utilize any additional libraries on top of these languages. We used the JavaScript Canvas API to draw the particle simulation directly to the screen and used simple DOM manipulation for any forms or styling necessary.

### Configuration

In order to allow for easy manipulation of parameters, we developed the simulation to pull all of its relevant parameters from a configuration object with attributes for each parameter. The default values for this configuration were stored in a separate JavaScript file. Because these values are loaded into a mutable object, it was easy to manipulate different configuration parameters by simply updating the configuration object.

### Generating Shapes

In order to avoid needing to determine the closest point on a shape, we generated all target shapes using the same Particle class that is used for the main particles. However, the shape particles were given a velocity of 0 and were non-physical, meaning the main particles could not collide with them and simply passed through. This shape generation method allowed us to track the closest point on the shape within the regular nested loop that checks the proximity between each particle and the other particles. Each particle was given an `is_shape` boolean variable to indicate whether or not it was a shape particle so that it could be considered appropriately in the main particle behavior.

### Particle Behavior

The particles move across the screen in the simulation simply by adding the value of their velocity vector to their position in each frame. However, the velocity vector was manipulated based on the basic movement rules and PSO rules in each frame before being applied to the position.

#### Basic Movement

Before implementing the particle swarming behavior, we implemented a simple simulation where particles fly around at constant speeds and directions, bouncing off one another and the viewport bounds. For each particle, we assigned a random velocity vector at initialization. To handle collisions between particles, we used the 2D vector rotation equation below to rotate each particle's velocity by the angle between their velocity vectors:

$$
\begin{pmatrix}
x' \\
y'
\end{pmatrix}
=
\begin{pmatrix}
\cos(\theta) & -\sin(\theta) \\
\sin(\theta) & \cos(\theta)
\end{pmatrix}
\begin{pmatrix}
x \\
y
\end{pmatrix}
$$

To handle collision with the viewport bounds, we simply multiplied the corresponding axis velocity by -1 to reverse the direction. For example, if a particle contacted the top part of the viewport, we multiplied its y-axis velocity by -1 to reverse its vertical direction but maintain its horizontal direction.

#### PSO Movement

To implement PSO into the particle behavior, we used the following PSO equations to update each particle's velocity and position in each frame:

$$
\begin{aligned}
v_{id}^{(t+1)} &= w \cdot v_{id}^{(t)} + c_1 \cdot r_1 \cdot (p_{id} - x_{id}^{(t)}) + c_2 \cdot r_2 \cdot (p_{gd} - x_{id}^{(t)}) \\
x_{id}^{(t+1)} &= x_{id}^{(t)} + v_{id}^{(t+1)} \\
\\\\
\text{Where:} & \\
&\text{- } v_{id}^{(t)} \text{ and } v_{id}^{(t+1)} \text{ are the velocity of particle } i \text{ in dimension } d \text{ at iteration } t \text{ and } t+1, \text{ respectively.} \\
&\text{- } x_{id}^{(t)} \text{ and } x_{id}^{(t+1)} \text{ are the position of particle } i \text{ in dimension } d \text{ at iteration } t \text{ and } t+1, \text{ respectively.} \\
&\text{- } w \text{ is the inertia weight, which controls the influence of the previous velocity of the particle on its current velocity.} \\
&\text{- } c_1 \text{ and } c_2 \text{ are the cognitive and social scaling coefficients, respectively.} \\
&\text{- } r_1 \text{ and } r_2 \text{ are random numbers typically drawn from a uniform distribution between 0 and 1, used to maintain the stochastic nature of the algorithm.} \\
&\text{- } p_{id} \text{ is the best known position of particle } i \text{ in dimension } d \text{ (personal best).} \\
&\text{- } p_{gd} \text{ is the best known position among all particles in the swarm in dimension } d \text{ (global best).}
\end{aligned}
$$

The personal best and global best positions were tracked based on nearby particles and shape particles. Each particle's personal best position was calculated in each frame by finding the position of the closest shape particle within the particle's shape detection range. If no shape particles were within range or the closest shape particle is farther away than the particles current personal best, the particle's personal best was not updated. Otherwise, the new personal best was set on the particle. Each time a new personal best position was set on a particle, a new personal best score is set as well, which is the value of the distance between that particle and the shape.

The global best position was calculated for each particle by finding the lowest personal best score of all other particles within the particle's social range. If this score was lower than the particle's existing global best score, the particle's global best position would be set to this positon and its global best score updated as well.

## Experimental Setup

### Test Cases

For each weight type (inertia, social, and cognition), we established a default value and a range of possible values from the below table:

| Weight    | Default Value | Value Range (start, stop, step) |
| --------- | ------------- | ------------------------------- |
| Inertia   | .5            | 0.1, 1, 0.1                     |
| Social    | 1             | 0.1, 4, 0.1                     |
| Cognition | 1             | 0.1, 4, 0.1                     |

Then, for each weight, we varied the weight across its value range while keeping the other weights at their default. For each combination of these weights, we added 10 test cases. Adding 10 of each combination allows us to compensate for the randomness associated with the PSO equation and still observe consistent trends. In total, this method produced 900 test cases for our experiment.

### Experiment Mode

In order to enable experimentation, we created a mode of our simulation called **Experiment Mode**. This mode will run the simulation in a "headless" environment, meaning it does not render any of the graphics and instead simply runs the JavaScript algorithm in the background. This mode runs the simulation on all of the generated test cases, sending the result of each experiment to the Go server to be added to a CSV file.
