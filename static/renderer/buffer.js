export default class Buffer {
    gl = null;
    bufferID = null;
    type = null;
    is_bound = false;
    data = null;

    // @param ctx The webGL context
    // @param data The data that we want to put in the buffer
    // @param type The type of buffer we want to create. --> ARRAY_BUFFER...
    constructor(ctx, data, type) {
        this.data = data;
        this.type = type;
        this.gl = ctx;
        this.bufferID = this.gl.createBuffer();
    }

    // @brief Bind the created buffer
    bind() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferID);
        this.is_bound = true;
        return this;
    }

    // @brief Create the bound buffer
    create(draw_type) {
        this.gl.bufferData(this.type, this.data, draw_type);
        return this;
    }
}
