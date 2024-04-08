import { Swarm } from "./swarm.js";

class App {
    constructor(numx, numy, box_size) {
        this.swarm = new Swarm();
        this.grid = document.getElementById("swarm-grid");
        this.context = this.grid.getContext("2d");
        this.context.canvas.width = numx * box_size;
        this.context.canvas.height = numy * box_size;

        this.grid_data = Array(numx)
            .fill()
            .map(() => Array(numy).fill(0));

        for (let i = 0; i < this.grid_data.length; i++) {
            for (let j = 0; j <= this.grid_data.length; j++) {
                this.grid_data[i][j] = Math.floor(Math.random() * 4);
            }
        }
        
        this.box_size = box_size;
    }

    create_grid() {
        for (let i = 0; i < this.grid_data.length; i++) {
            for (let j = 0; j <= this.grid_data.length; j++) {
                this.context.beginPath();
                this.context.rect(
                    i * this.box_size,
                    j * this.box_size,
                    this.box_size,
                    this.box_size
                );
                this.context.strokeStyle = "#363636";
                this.context.fillStyle = "cyan";
                if (this.grid_data[i][j] === 3) {
                    this.context.fill();
                } else {
                }
                this.context.stroke();
            }
        }
    }
}

let app = new App(130, 70, 10, 10);
app.create_grid();
