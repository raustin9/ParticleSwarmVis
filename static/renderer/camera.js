let glib = glMatrix;

export default class Camera {
    gl = null;
    fov = 0;
    aspect = 0;
    near_cull = 0;
    far_cull = 0;
    projection_matrix = glib.mat4.create();

    constructor(ctx, fov, aspect, near_cull, far_cull) {
        this.gl = ctx;
        glib.mat4.perspective(
            this.projection_matrix,
            fov,
            aspect,
            near_cull,
            far_cull
        );
    }
}
