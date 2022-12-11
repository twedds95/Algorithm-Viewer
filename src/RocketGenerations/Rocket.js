import { ROCKET_DIM, randomNumber } from "./SmartRockets";

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

    this.isBoostersOn = false;
    this.isCrashed = false;
    this.isLanded = false;
    this.lastFrame = 1;
    this.dna = dna;


    this.applyForce = function () {
        let index = this.frame++;
        if (index >= this.dna.length) {
            return;
        }

        this.isBoostersOn = this.frame < this.fuelCapacity;

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
            this.rotation = Math.atan2(this.velocity.x, -this.velocity.y) * 180 / Math.PI;
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
        if (!this.isLanded && !this.isCrashed) {
            this.applyForce();
            //check if isCrashed or isLanded with obstacles and bounds
            let rocketTrianglePoints = this.getTrianglePointsFromRocket();
            for (let i = 0; i < obstacles.length; i++) {
                let o = obstacles[i];
                if (isOneOfTrianglePointsInEllipse(rocketTrianglePoints, o.x, o.y, o.radius, o.radius)) {
                    this.isCrashed = true;
                    this.lastFrame = this.frame;
                }
            }
            if (isOneOfTrianglePointsInEllipse(rocketTrianglePoints, bounds.finish.x, bounds.finish.y, bounds.finish.radius, bounds.finish.radius)) {
                this.isLanded = true;
                this.lastFrame = this.frame;
            }
            if (!this.isLanded && isOneOfTrianglePointsOutOfBOunds(rocketTrianglePoints, bounds)) {
                this.isCrashed = true;
                this.lastFrame = this.frame;
            }
        }
        return this.isLanded || this.isCrashed || this.frame >= this.dna.length;
    }

    this.calculateStrengths = function (finish) {
        let multiplier = 1;
        if (this.isLanded) {
            multiplier = 2;
        }
        if (this.isCrashed) {
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

    this.getTrianglePointsFromRocket = function () {
        let rcx = this.pos.x + ROCKET_DIM / 2;
        let rcy = this.pos.y + ROCKET_DIM / 2;

        let rocketTipX = rcx + ROCKET_DIM / 2 * Math.cos(this.rotation * Math.PI / 180);
        let rocketTipY = rcy - ROCKET_DIM / 2 * Math.sin(this.rotation * Math.PI / 180);

        let leftBaseX = rcx + ROCKET_DIM / 2 * Math.cos((this.rotation + 225) * Math.PI / 180);
        let leftBaseY = rcy - ROCKET_DIM / 2 * Math.sin((this.rotation + 225) * Math.PI / 180);

        let rightBaseX = rcx + ROCKET_DIM / 2 * Math.cos((this.rotation + 135) * Math.PI / 180);
        let rightBaseY = rcy - ROCKET_DIM / 2 * Math.sin((this.rotation + 135) * Math.PI / 180);
        return [{ x: rocketTipX, y: rocketTipY }, { x: leftBaseX, y: leftBaseY }, { x: rightBaseX, y: rightBaseY }];
    }

}

function isOneOfTrianglePointsOutOfBOunds(trianglePoints, bounds) {
    for (let i = 0; i < trianglePoints.length; i++) {
        const { x, y } = trianglePoints[i];
        if (x < bounds.left - 5 || x > bounds.right || y < bounds.top || y > bounds.bottom)
            return true;
    }
    return false;
}

function isOneOfTrianglePointsInEllipse(trianglePoints, ex, ey, ea, eb) {
    for (let i = 0; i < trianglePoints.length; i++) {
        const { x, y } = trianglePoints[i];
        if (isPointInEllipse(x, y, ex, ey, ea, eb))
            return true;
    }
    return false;
}

function isPointInEllipse(x1, y1, ex, ey, ea, eb) {
    return ((Math.pow((x1 - ex), 2) / Math.pow(ea, 2)
        + Math.pow((y1 - ey), 2) / Math.pow(eb, 2)) <= 1)
}

// Overcomplicated and not used
// function checkIfLineIntersectsEllipse(x1, y1, x2, y2, h, k, a, b) {
//     // y = -mx+c == y + mx = c
//     let m = 0, c = 0;
//     if (Math.abs(x2 - x1) < Number.EPSILON) { // special case where line is vertical x = const
//         return (a - b * (c / m - h) * (x1 - h)) >= 0;
//     }
//     m = (y1 - y2) / (x2 - x1);
//     c = y1 + m * x1;
//     // ellipse == (x - h)** / a + (y - k)** / b = 1
//     // derived formula to see if ellipse and line intersect (it's pretty long, so just look it up loser)
//     // also be careful because you used y = -m + c like an idiot so... 
//     let A = b + a * m * m;
//     let B = 2 * (a * m * k - a * m * c - b * h);
//     let C = b * h * h + a * c * c + a * k * k - 2 * a * c * k - a * b;
//     return B * B - 4 * A * C >= 0;
// }

// keep genes bounded between min and max
function randomGene() {
    return { x: randomNumber(MAX_FORCE_X, -MAX_FORCE_X), y: randomNumber(0, -MAX_FORCE_Y) };
}