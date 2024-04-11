// Types of uniform buffers that we want to create
// Used when binding
export const UniformType = Object.freeze({
    UI1: {},
    UI2: {},
    UI3: {},
    UI4: {},

    FV1: {},
    FV2: {},
    FV3: {},
    FV4: {},

    IV1: {},
    IV2: {},
    IV3: {},
    IV4: {},

    UIV1: {},
    UIV2: {},
    UIV3: {},
    UIV4: {},

    MAT2X2FV: {},
    MAT3X3FV: {},
    MAT4X4FV: {},
    
    MAT3X2FV: {},
    MAT2X3FV: {},
    
    MAT4X2FV: {},
    MAT2X4FV: {},

    MAT4X3FV: {},
    MAT3X4FV: {},
});


export default class UniformBuffer {
    gl = null;
    name = "";
    data = null;
    type = null;
    
    constructor(
        ctx,
        uniform_name,
        uniform_data,
        uniform_data_type
    ) {
        this.gl = ctx;
        this.name = uniform_name;
        this.data = uniform_data;
        this.type = uniform_data_type;
    }

    bind(shader) {
        let location = shader.get_uniform_location(this.name);
        // console.log(`Got location for ${this.name}`);
        // console.log(this.data);

        switch(this.type) {
            case UniformType.MAT4X4FV:
                this.gl.uniformMatrix4fv(
                    location,
                    false,
                    this.data
                );
                break;
            default:
                console.error(`UniformBuffer::bind: Uniform type of ${this.type} is not implemented yet for binding!`);
                return;
        }
    }

};
