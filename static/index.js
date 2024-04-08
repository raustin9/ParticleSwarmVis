import { Swarm } from "./swarm.js";

class App {
    constructor(dimension, numx, numy, boxw, boxh) {
        this.swarm = new Swarm();
        this.grid = document.getElementById("swarm-grid");
        this.context = this.grid.getContext("2d");
        this.context.canvas.width = dimension;
        this.context.canvas.height = dimension;

        this.grid_data = Array(numx)
            .fill()
            .map(() => Array(numy).fill(0));
        
        this.boxw = boxw;
        this.boxh = boxh;
    }

    create_grid() {
        for (let i = 0; i < this.grid_data.length; i++) {
            for (let j = 0; j <= this.grid_data.length; j++) {
                this.context.beginPath();
                this.context.rect(
                    i * this.boxw,
                    j * this.boxh,
                    this.boxw,
                    this.boxh
                );
                this.context.strokeStyle = "green";
                this.context.stroke();
            }
        }
    }
}

let app = new App(800, 80, 80, 15, 15);
app.create_grid();
