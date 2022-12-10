import React from "react";
import "./rocketArea.css"
import Rocket from "./Rocket";

// TODOS:
// - make user variable NUMBER_OF_ROCKETS - MUTATION_ODDS - MAX_SPEED - MASS - GRAVITY

const HEIGHT = 500;
const WIDTH = window.innerWidth * 0.9;
export const ROCKET_DIM = 24;

const NUMBER_OF_OBSTACLES = Math.ceil(WIDTH / 250);
const NUMBER_OF_ROCKETS = 50;

const SPEED = 500;
const NUMBER_OF_FRAMES = 5000;

export default class SmartRockets extends React.Component {
    constructor(props) {
        super(props);
        let rockets = [];
        for (let i = 0; i < NUMBER_OF_ROCKETS; i++) {
            let rocket = new Rocket(WIDTH / 5, HEIGHT - ROCKET_DIM);
            rocket.randomizeGenes(NUMBER_OF_FRAMES);
            rockets.push(rocket);
        }
        this.state = {
            population: { generation: 0, rockets: rockets },
            allStopped: false,
            obstacles: this.randomizeObstacles(),
            finish: { x: WIDTH, y: HEIGHT / 2, radius: 100 }
        };

        this.launchRockets = this.launchRockets.bind(this);
    }

    componentDidMount() {
    }

    renderStuff() {
        const stuff = [];
        let obs = this.state.obstacles;
        for (let i = 0; i < obs.length; i++) {
            stuff.push(<ellipse cx={obs[i].x} cy={obs[i].y} rx={obs[i].width} ry={obs[i].height} fill="black"
                                stroke="grey" strokeWidth="1"/>)
        }
        let rockets = this.state.population.rockets;
        for (let i = 0; i < rockets.length; i++) {
            stuff.push(<svg xmlns="http://www.w3.org/2000/svg" width={ROCKET_DIM} height={ROCKET_DIM}
                x={rockets[i].pos.x} y={rockets[i].pos.y}>
                <path
                    transform-origin="center"
                    transform={"rotate(" + rockets[i].rotation + ")"}
                    d="M13.404 23h-2.808l-.96-2h4.728l-.96 2zm-8.323-7.365c-1.218 1.202-2.081 3.377-2.081 5.696 0 .884.127 1.789.405 2.669.255-1.837 1.122-3.2 3.162-3.773-.634-1.402-1.154-2.949-1.486-4.592zm13.83-.01c-.371 1.772-.92 3.333-1.477 4.602 2.039.573 2.906 1.936 3.161 3.773.278-.88.405-1.785.405-2.67 0-2.324-.867-4.504-2.089-5.705zm-6.926-15.625c-7.076 6.157-5.909 14.779-3.324 20h6.685c2.59-5.483 3.765-13.883-3.361-20zm.015 14c-.552 0-1-.448-1-1s.448-1 1-1 1 .448 1 1-.448 1-1 1zm0-4c-1.104 0-2-.896-2-2s.896-2 2-2 2 .896 2 2-.896 2-2 2z" />
            </svg>);
        }
        let finish = this.state.finish;
        stuff.push(<ellipse cx={finish.x} cy={finish.y} rx={finish.radius / 2} ry={finish.radius} fill="blue"
            stroke="blue" strokeWidth="1" />);
        return stuff;
    }

    render() {
        return (
            <div>
                <h1>Generation Smart Rockets</h1>
                <label>Generation: {this.state.population.generation}</label>
                <button onClick={() => this.reset()}>Reset Rockets</button>
                <button onClick={() => this.launchRockets()}>Launch Rockets</button>
                <div>
                    <svg className="rocketArea">
                        {this.renderStuff()}
                    </svg>
                </div>

            </div>
        );
    }

    reset() {
        window.location.reload(true);
    }

    getCurrentGeneration() {
        let bounds = { left: 0, right: WIDTH, top: 0, bottom: HEIGHT, finish: this.state.finish };
        let rockets = this.state.population.rockets;
        let isStopped = true;
        for (let i = 0; i < rockets.length; i++) {
            isStopped = rockets[i].updatePosition(this.state.obstacles, bounds) && isStopped;
        }
        let newPopulation = { generation: this.state.population.generation, rockets: rockets };
        return ({ population: newPopulation, allStopped: isStopped });
    }


    launchRockets() {
        for (let i = 0; i < NUMBER_OF_FRAMES; i++) {
            const running = setInterval(() => {
                this.setState(this.getCurrentGeneration());
                if (this.state.allStopped) {
                    clearInterval(running);
                    this.updateGeneration();
                }
            }, i * SPEED);
        }
    }

    updateGeneration() {
        let matingPool = [];
        let maxStrength = 0;
        for (let i = 0; i < this.state.population.rockets.length; i++) {
            this.state.population.rockets[i].calculateStrengths(this.state.finish);
            maxStrength = Math.max(this.state.population.rockets[i].strength, maxStrength);
        }
        for (let i = 0; i < this.state.population.rockets.length; i++) {
            let r = this.state.population.rockets[i];
            let s = NUMBER_OF_ROCKETS * r.strength / maxStrength;
            for (let j = 0; j < s; j++) {
                matingPool.push(r);
            }
        }
        let newRockets = [];
        for (let i = 0; i < NUMBER_OF_ROCKETS && matingPool.length > 0; i++) {
            let parents = [Math.floor(Math.random() * matingPool.length), Math.floor(Math.random() * matingPool.length)];
            newRockets.push(matingPool[parents[0]].makeChild(matingPool[parents[1]]));
        }
        this.setState({population: {generation: this.state.population.generation + 1, rockets: newRockets}, allStopped: false});
        this.launchRockets();
    }
    
    randomizeObstacles() {
        const obs = [];
        for (let i = 0; i < NUMBER_OF_OBSTACLES; i++) {
            let startX = (WIDTH * 0.2);
            let endX = (WIDTH * 0.8);
            let x = startX + (endX - startX) / NUMBER_OF_OBSTACLES * (i + 0.5);
            let y = Math.random() * ((HEIGHT * 0.9) - (HEIGHT * 0.1) + 1) + (HEIGHT * 0.1);
            let width = Math.random() * (WIDTH * 0.04) + 2;
            let height = Math.random() * 50 + 2;
            obs.push({x, y, width, height});
        }
        return obs;
    }
}