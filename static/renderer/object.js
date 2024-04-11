import Shader from "./shader.js";
import ArrayBuffer from "./array_buffer.js";

let glib = glMatrix; // naming convenience

export default class Object {
    gl = null;

    buffers = [];
    uniforms = [];
    
    shader = null;
    has_shader = false;

    draw_type = null; // WebGL buffer draw type. 
                      // defaults to STATIC_DRAW

    model_matrix = glib.mat4.create();

    constructor(ctx, vertex_count) {
        this.gl = ctx;
        this.vertex_count = vertex_count;
        
        this.draw_type = this.gl.STATIC_DRAW;

        return this;
    }

    // @brief Specify the vertex data for the object
    // @param vertices The vertex position data
    // @param buffer_type The type of WebGL buffer. ARRAY_BUFFER etc
    // @param draw_type The type of buffer draw type we want. STATIC_DRAW DYNAMIC_DRAW etc
    add_vertex_data(
        vert_data, 
        name, 
        buffer_type, 
        per_vertex_count,
        draw_type=this.gl.STATIC_DRAW
    ) {
        this.draw_type = draw_type;
        switch (buffer_type) {
            case this.gl.ARRAY_BUFFER:
                console.log(`Creating ${name} with ${per_vertex_count} components.`);
                let buf = new ArrayBuffer(
                    this.gl, 
                    name,
                    vert_data,
                    per_vertex_count,
                    this.gl.ARRAY_BUFFER,
                    this.gl.FLOAT,
                );
                buf.bind();
                buf.create(draw_type);
                buf.unbind();
                this.buffers.push(buf);
                break;
            default:
                console.error(`Object::add_vertices: invalid type of buffer: ${buffer_type}`);
        }

        return this;
    }

    add_uniform(
        buf
    ) {
        this.uniforms.push(buf);
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

        for (let i = 0; i < this.buffers.length; i++) {
            this.buffers[i].bind_and_enable(this.shader);
        }
        for (let i = 0; i < this.uniforms.length; i++) {
            this.uniforms[i].bind(this.shader);
        }

        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertex_count);
    }
}
