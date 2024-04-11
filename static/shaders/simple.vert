attribute vec3 a_position;
attribute vec4 a_color;

uniform mat4 u_model_view;
uniform mat4 u_projection;

varying lowp vec4 v_color;

void main(void) {
    gl_Position = u_projection * u_model_view * vec4(a_position.xyz, 1.0);
    // v_color = vec4(coordinates, 0.0, 1.0);
    v_color = a_color;
}
