export default class AttributeBuffer {
    gl = null;        // the WebGL context
    bufferID = null;  // the handle to the buffer
    type = null;      // ARRAY_BUFFER etc
    is_bound = false; // whether the buffer is currently bound
    data = null;      // the buffer data to be stored
    name = "";        // the name of the attribute that this corresponds to
    components = 0;        // the name of the attribute that this corresponds to

    // @param ctx The webGL context
    // @param data The data that we want to put in the buffer
    // @param type The type of buffer we want to create. --> ARRAY_BUFFER...
    constructor(ctx, name, data, per_vert_components, type=null) {
        this.data = data;
        this.name = name;
        this.gl = ctx;
        this.bufferID = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferID);

        if (!type) {
            console.error(`Buffer::Buffer(): must specify data type!`);
        }
        this.type = type;
        
        if (!per_vert_components) {
            console.error(`Buffer::Buffer(): must specify per_vert_components!`);
        }
        this.components = per_vert_components;
        console.log(`${name}: ${this.components} components.`);
    }

    /** 
        * @brief Bind the created buffer
    */
    bind() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferID);
        this.is_bound = true;
        return this;
    }

    /**
        * @brief Unbind the buffer
    */
    unbind() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    /**
        * @brief Bind the shader and enable it based on the location
        * @param {Shader} shader The shader we are finding the location in
    */
    bind_and_enable(shader) {
        this.bind();
        let location = shader.get_attribute_location(this.name);
        this.gl.vertexAttribPointer(location, this.components, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(location);
    }

    /**
        * @brief Create the buffer from the data
        * @param draw_type The draw type we want to use. STATIC_DRAW, DYAMIC_DRAW, STREAM_DRAW
    */
    create(draw_type) {
        this.gl.bufferData(this.type, this.data, draw_type);
        return this;
    }
}
