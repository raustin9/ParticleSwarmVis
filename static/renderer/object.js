import Shader from "./shader.js";
import Buffer from "./buffer.js";

export default class Object {
    gl = null;
    
    vertices = null;
    vertex_buffer = null;
    
    shader = null;
    has_shader = false;

    draw_type = null; // WebGL buffer draw type. 
                      // defaults to STATIC_DRAW


    constructor(ctx) {
        this.gl = ctx;
        
        this.draw_type = this.gl.STATIC_DRAW;

        return this;
    }

    // @brief Specify the vertex data for the object
    // @param vertices The vertex position data
    // @param buffer_type The type of WebGL buffer. ARRAY_BUFFER etc
    // @param draw_type The type of buffer draw type we want. STATIC_DRAW DYNAMIC_DRAW etc
    add_vertices(vertices, buffer_type, draw_type=this.gl.STATIC_DRAW) {
        this.draw_type = draw_type;
        switch (buffer_type) {
            case this.gl.ARRAY_BUFFER:
                this.vertex_buffer = new Buffer(this.gl, vertices, this.gl.ARRAY_BUFFER);
                this.vertex_buffer.bind();
                this.vertex_buffer.create(draw_type);
                this.vertex_buffer.unbind();
                break;
            default:
                console.error(`Object::add_vertices: invalid type of buffer: ${buffer_type}`);
        }

        return this;
    }

    // @brief Add a shader to this object if it does not have one already
    add_shader(shader) {
        if (!this.has_shader) {
            this.shader = shader;
            this.has_shader = true;
        } else {
            console.warn("Object already has shader");
        }

        return this;
    }

    // @brief Specify the draw type we want the buffer to use
    // STATIC_DRAW
    // DYNAMIC_DRAW
    // STREAM_DRAW
    set_draw_type(type) {
        if (type == this.gl.STATIC_DRAW
            || type == this.gl.DYNAMIC_DRAW
            || type == this.gl.STREAM_DRAW
        ) {
            this.draw_type = type;
            return this;
        }
        
        console.error(`Object::set_draw_type: invalid draw type: ${type}`);
        return this;
    }

    // @brief Draw the object
    draw() {
        this.gl.useProgram(this.shader.shaderProgram);
        this.vertex_buffer.bind();

        let coord = this.gl.getAttribLocation(this.shader.shaderProgram, "coordinates");

        this.gl.vertexAttribPointer(coord, 2, this.gl.FLOAT, false, 0, 0);
        
        this.gl.enableVertexAttribArray(coord);
    }
}
