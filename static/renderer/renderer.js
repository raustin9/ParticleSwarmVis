import helpers from "./lib/helpers.js";
import Shader from "./shader.js";
import Object from "./object.js"
import UniformBuffer, { UniformType } from "./uniform_buffer.js";

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
    aspect = 0;

    drawable_objects = []; // List of objects that 
                           // will be rendered to the scene
    

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
            this.aspect = this.gl.canvas.width / this.gl.canvas.height;
        } else {
            console.warn("Dimensions not specified on renderer. Not resizing");
        }
    }

    render() {
        let vsource = helpers.read_file_sync("shaders/simple.vert");
        let fsource = helpers.read_file_sync("shaders/simple.frag");
        this.shader = new Shader(this.gl, vsource, fsource);

        let fov = (45 * Math.PI) / 180;
        // let aspect = this.gl.canvas.clientWidth / this.gl.clientHeight;
        let aspect = this.gl.canvas.width / this.gl.height;
        let projection_matrix = glib.mat4.create();
        let near_cull = 0.01;
        let far_cull = 100000.0;
        glib.mat4.perspective(
            projection_matrix, 
            fov, 
            this.aspect, 
            near_cull, 
            far_cull
        );
        
        let model_view_matrix = glib.mat4.create();
        glib.mat4.translate(model_view_matrix, model_view_matrix, 
            [-0.0, -0.0, -6.0]
        );

        let ProjectionBuf = new UniformBuffer(
            this.gl,
            "u_projection",
            projection_matrix,
            UniformType.MAT4X4FV
        );

        let ModelViewBuf = new UniformBuffer(
            this.gl,
            "u_model_view",
            model_view_matrix,
            UniformType.MAT4X4FV,
        );

        console.log(this.aspect);
        console.log(projection_matrix);
        console.log(model_view_matrix);


        const positions = new Float32Array(
            [
                -0.5, -0.5, 0.0,
                 0.5, -0.5, 0.0,
                 0.5,  0.5, 0.0,

                 0.5,  0.5, 0.0,
                -0.5,  0.5, 0.0,
                -0.5, -0.5, 0.0,
            ]
        );

        let colors = new Float32Array([
            0.2, 0.3, 0.5, 1.0,
            0.5, 0.1, 0.8, 1.0,
            0.4, 0.7, 0.8, 1.0,
            0.4, 0.7, 0.8, 1.0,
            
            0.4, 0.7, 0.8, 1.0,
            0.2, 0.3, 0.5, 1.0,
            0.5, 0.1, 0.8, 1.0,
            0.4, 0.7, 0.8, 1.0,
        ]);

        let square = new Object(this.gl, positions.length / 3)
            .add_shader(this.shader)
            .add_vertex_data(positions, "a_position", this.gl.ARRAY_BUFFER, 3)
            .add_vertex_data(colors, "a_color", this.gl.ARRAY_BUFFER, 4)
            .add_uniform(ProjectionBuf)
            .add_uniform(ModelViewBuf)
        ;

        this.drawable_objects.push(square);

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0.0, 0.0, 0.0, 0.3);
        this.gl.depthFunc(this.gl.LEQUAL);
        
        requestAnimationFrame(this.#animate.bind(this));
    }

    // @brief Animate sequence for rendering
    #animate(now) {
        now *= 0.001;
        let delta_time = now - this.then;
        this.then = now;
        this.#draw_frame(delta_time);
        requestAnimationFrame(this.#animate.bind(this));
    }

    // @brief Render a frame of the scene
    #draw_frame(delta_time) {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        for (let i = 0; i < this.drawable_objects.length; i++) {
            this.drawable_objects[i].draw();
        }
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
