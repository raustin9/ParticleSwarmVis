import helpers from "./lib/helpers.js";
import Shader from "./shader.js";
import Buffer from "./buffer.js";
import Object from "./object.js"

let glib = glMatrix; // naming convenience

export default class Renderer {
    window = null;
    gl = null;
    canvas = null;
   
    // Matrices
    projection_matrix = glib.mat4.create();
    camera_matrix = glib.mat4.create();
   
    shader = null;
    positionBuffer = null;

    then = 0;
    total_time = 0;
    

    constructor(canvas, x, y) {
        this.window = window;
        this.canvas = canvas;
        // this.gl = canvas.getContext('webgl2');
        this.gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true });
        if (!this.gl) {
            console.error("Unable to create webgl context!");
            throw new Error("Unable to create webgl context");
        }
        
        if (x !== null || y !== null) {
            this.canvas.width = x;
            this.canvas.width = y;
            this.gl.canvas.width = x;
            this.gl.canvas.height = y;
        } else {
            console.warn("Dimensions not specified on renderer. Not resizing");
        }
    }

    render() {
        let vsource = helpers.read_file_sync("shaders/simple.vert");
        let fsource = helpers.read_file_sync("shaders/simple.frag");
        this.shader = new Shader(this.gl, vsource, fsource);

        
        let positions  = new Float32Array(
            [
                -0.5, -0.5, 
                 0.5, -0.5, 
                 0.5,  0.5, 

                 0.5,  0.5, 
                -0.5,  0.5, 
                -0.5, -0.5, 
            ]
        );

        let square = new Object(this.gl)
            .add_shader(this.shader)
            .add_vertices(positions, this.gl.ARRAY_BUFFER)
        ;

        square.draw();
        
        this.gl.clearColor(0.5, 0.5, 0.8, 0.9);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    #animate(now) {
        now *= 0.001;
        let delta_time = now - this.then;
        this.then = now;
        this.#draw_frame(delta_time);
        requestAnimationFrame(this.#animate.bind(this));
    }

    #draw_frame(delta_time) {
        let positions = [0.5, 0.5, 0.1,-0.5, 0.5,-0.5];
        let vertex_buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertex_buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);


    }

    // @brief Create the projection matrix
    #create_projection_matrix() {
        this.projection_matrix = glib.mat4.create();
        const near_cull = 0.001;
        const far_cull = 10000;
        const fov = (45 * Math.PI) / 180;
        const aspect_ratio = this.canvas.clientWidth / this.canvas.clientHeight;
        // const aspect_ratio = this.canvas.clientWidth / this.canvas.clientHeight;
        
        glib.mat4.perspective(
            this.projection_matrix,
            fov,
            aspect_ratio,
            near_cull,
            far_cull
        );
    }
}
