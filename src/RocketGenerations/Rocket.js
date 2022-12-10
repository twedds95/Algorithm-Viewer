import { ROCKET_DIM } from "./SmartRockets";

const MUTATION_ODDS = 0.10;
const MAX_SPEED = 1;
const MAX_FORCE_X = 40;
const MAX_FORCE_Y = 10;
const GRAVITY = 3;
const MASS = 1e4;

export default function Rocket(startX, startY, fuelCapacity, dna) {
    this.fuelCapacity = fuelCapacity;
    this.frame = 0;
    this.pos = { x: startX, y: startY };
    this.velocity = { x: 0, y: 0 };      
    this.rotation = 0;
    this.acceleration = { x: 0, y: 0 };
    this.strength = 0;
    this.distanceTravelled = 0;

    this.crashed = false;
    this.landed = false;
    this.lastFrame = 1;
    this.dna = dna;


    this.applyForce = function () {
        let index = this.frame++;
        if (index >= this.dna.length) {
            return;
        }
        this.acceleration.x = this.dna[index].x / MASS;
        this.acceleration.y = (this.dna[index].y + GRAVITY) / MASS;

        this.accelerateRocket();

        this.pos.x += this.velocity.x;
        this.pos.y += this.velocity.y;

        this.distanceTravelled += (this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    }

    this.accelerateRocket = function () {
        let newV_x = this.velocity.x + this.acceleration.x;
        let newV_y = this.velocity.y + this.acceleration.y;
        if (Math.sqrt(newV_x * newV_x + newV_y * newV_y) < MAX_SPEED) {
            this.velocity.x = newV_x;
            this.velocity.y = newV_y;
        }
        if (Math.sqrt(this.acceleration.x * this.acceleration.x +
            this.acceleration.y * this.acceleration.y) > MAX_SPEED / MASS) {
            this.rotation = Math.atan2(this.velocity.y, this.velocity.x) * 180 / Math.PI;
            this.rotation += 90;
        }
    }

    this.makeChild = function (otherRocket) {
        let newDNA = [];
        let newFuelCapacity = this.fuelCapacity;
        if (Math.random() > 0.5) {
            newFuelCapacity = otherRocket.fuelCapacity;
        }
        for (let i = 0; i < this.dna.length; i++) {
            if (Math.random() < MUTATION_ODDS) {
                newDNA.push(randomGene());
            }
            else if (i > newFuelCapacity) {
                newDNA.push({ x: 0, y: 0 });
            }
            // if not mutated, and still has fuel capacity get gene from one of the parents
            else if (Math.random() > 0.5) {
                newDNA.push(otherRocket.dna[i]);
            } else {
                newDNA.push((this.dna[i]));
            }
        }
        return new Rocket(startX, startY, newFuelCapacity, newDNA);
    }

    this.updatePosition = function (obstacles, bounds) {
        if (!this.landed && !this.crashed) {
            this.applyForce();
            //check if crashed or landed with obstacles and bounds
            for (let i = 0; i < obstacles.length; i++) {
                let o = obstacles[i];
                if (checkIfRocketIntersectsEllipse(this.pos.x, this.pos.y, o.x, o.y, o.width, o.height)) {
                    this.crashed = true;
                    this.lastFrame = this.frame;
                }
            }
            if (checkIfRocketIntersectsEllipse(this.pos.x, this.pos.y, bounds.finish.x, bounds.finish.y, bounds.finish.radius, bounds.finish.radius)) {
                this.landed = true;
                this.lastFrame = this.frame;
            }
            if (!this.landed && (this.pos.x + 10 <= bounds.left || this.pos.x >= bounds.right || this.pos.y <= bounds.top || this.pos.y + 10 >= bounds.bottom)) {
                this.crashed = true;
                this.lastFrame = this.frame;
            }
        }
        return this.landed || this.crashed || this.frame >= this.dna.length;
    }

    this.calculateStrengths = function (finish) {
        let multiplier = 1;
        if (this.landed) {
            multiplier = 2;
        }
        if (this.crashed) {
            multiplier = 0.5;
        }
        let distanceX = this.pos.x - finish.x;
        let distanceY = this.pos.y - finish.y;
        this.strength = multiplier * this.lastFrame * this.distanceTravelled
            / Math.pow((distanceX * distanceX + distanceY * distanceY), 1 / 2);
    }

    this.randomizeGenes = function (totalDnaSize) {
        this.dna = [];
        this.fuelCapacity = Math.ceil(totalDnaSize * Math.random());
        for (let i = 0; i < this.fuelCapacity; i++) {
            this.dna.push(randomGene());
        }
        for (let i = this.fuelCapacity; i < totalDnaSize; i++) {
            this.dna.push({ x: 0, y: 0 });
        }
    }

}

function checkIfRocketIntersectsEllipse(rx, ry, ex, ey, ea, eb) {
    if ((Math.pow((rx - ex), 2) / Math.pow(ea, 2)
        + Math.pow((ry - ey), 2) / Math.pow(eb, 2)) <= 1)
        return true;
    if ((Math.pow((rx + ROCKET_DIM - ex), 2) / Math.pow(ea, 2)
        + Math.pow((ry - ey), 2) / Math.pow(eb, 2)) <= 1)
        return true;
    if ((Math.pow((rx - ex), 2) / Math.pow(ea, 2)
        + Math.pow((ry + ROCKET_DIM - ey), 2) / Math.pow(eb, 2)) <= 1)
        return true;
    if ((Math.pow((rx + ROCKET_DIM - ex), 2) / Math.pow(ea, 2)
        + Math.pow((ry + ROCKET_DIM - ey), 2) / Math.pow(eb, 2)) <= 1)
        return true;

    return false;
}

// keep genes bounded between min and max
function randomGene() {
    return { x: MAX_FORCE_X * (Math.random() * 2 - 1), y: MAX_FORCE_Y * (Math.random() - 1) };
}