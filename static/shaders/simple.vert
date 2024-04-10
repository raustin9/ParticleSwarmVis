attribute vec2 coordinates;

varying lowp vec4 v_color;

void main(void) {
    gl_Position = vec4(coordinates, 0.0, 1.0);
    v_color = vec4(coordinates, 0.0, 1.0);
}
