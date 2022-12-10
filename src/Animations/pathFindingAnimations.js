import React from "react";
import './pathFindingAnimations.css';
import { getA_StarAnimations } from "../PathFindingAlgorithms/aStar";

const PRIMARY_COLOR = '#e7e4e4';
const START_COLOR = 'rgb(3,253,77)';
const END_COLOR = '#c925e7';
const WALL_COLOR = '#000000';
const PATH_COLOR = '#428bca';
const VISITED_COLOR = 'rgba(213,48,48,0.47)';
const FAILURE_COLOR = 'rgb(255,0,0)';

const SPEED = 5;
const PROB_OF_WALL = 0.25;
const NUMBER_OF_BOXES_WIDTH = Math.floor(window.innerWidth * 0.1);
const NUMBER_OF_BOXES_HEIGHT = Math.floor(window.innerHeight * 0.09);
const BOX_DIM = 6;
const MARGIN = 2;

const ALGORITHMS = ["A*"];


export default class PathFindingVisualizer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            grid: []
        };
    }

    componentDidMount() {
        this.resetGrid();
    }

    resetGrid() {
        const grid = [];
        // let points = generateTwoUniquePoints();
        // let start = {isA: 'start', x: points.startX, y: points.startY};
        // let end = {isA: 'end', x: points.endX, y: points.endY};
        let start = { isA: 'start', x: 0, y: 0 };
        let end = { isA: 'end', x: NUMBER_OF_BOXES_WIDTH - 1, y: NUMBER_OF_BOXES_HEIGHT - 1 };
        for (let i = 0; i < NUMBER_OF_BOXES_WIDTH; i++) {
            for (let j = 0; j < NUMBER_OF_BOXES_HEIGHT; j++) {
                if (!((i === start.x && j === start.y) || (i === end.x && j === end.y))) {
                    if (Math.random() < PROB_OF_WALL) {
                        grid.push({ isA: 'wall', x: i, y: j });
                    } else {
                        grid.push({ isA: 'free', x: i, y: j });
                    }
                }
            }
        }
        grid.push(start);
        grid.push(end);
        this.setState({ grid });
    }

    resetPath() {
        window.location.reload(true);
    }

    animatePath() {
        document.getElementById('startButton').disabled = true;
        document.getElementById('startButton').innerText = "Calculating...";
        return new Promise((runAnimations) => {
            setTimeout(() => {
                this.runAnimations();
                document.getElementById('startButton').innerText = "Finding Path";
            });
        });
    }

    runAnimations = () => {
        let animations = [];
        switch (document.getElementById('algorithm').value) {
            case "A*":
                animations = getA_StarAnimations(this.state.grid);
                break;

            default:
                break;
        }

        for (let i = 0; i < animations.length; i++) {
            let action = animations[i].action;
            const square = animations[i].square;
            const gridSquareID = (square.y * NUMBER_OF_BOXES_WIDTH) + square.x + 1;
            const gridSquare = document.getElementById(gridSquareID);
            const gridSquareStyle = gridSquare.style;
            if (action === 'newPath') {
                setTimeout(() => {
                    gridSquareStyle.backgroundColor = PATH_COLOR;
                }, i * SPEED);
            } else if (action === 'visit') {
                setTimeout(() => {
                    gridSquareStyle.backgroundColor = VISITED_COLOR;
                }, i * SPEED);
            } else if (action === 'failure') {
                setTimeout(() => {
                    gridSquareStyle.backgroundColor = FAILURE_COLOR;
                }, i * SPEED);
            } else if (action === 'rebuild') {
                setTimeout(() => {
                    gridSquareStyle.backgroundColor = PATH_COLOR;
                }, i * SPEED);
            }
        }
    }

    createSelection() {
        let select = []
        for (let i = 0; i < ALGORITHMS.length; i++) {
            select.push(<option value={ALGORITHMS[i]}>{ALGORITHMS[i]}</option>)
        }
        return select
    }

    renderTheGrid(grid) {
        let y = grid.y * (BOX_DIM + MARGIN)
        let x = grid.x * (BOX_DIM + MARGIN)
        let key = (grid.y * NUMBER_OF_BOXES_WIDTH) + grid.x + 1;
        let color;
        switch (grid.isA) {
            case 'free':
                color = PRIMARY_COLOR;
                break;
            case 'wall':
                color = WALL_COLOR;
                break;
            case 'start':
                color = START_COLOR;
                break;
            case 'end':
                color = END_COLOR;
                break;
            default:
                color = PRIMARY_COLOR;
                break;
        }
        return <div
            className="grid-square"
            id={key}
            style={{
                backgroundColor: color,
                top: `${y}px`,
                left: `${x}px`,
                width: `${BOX_DIM}px`,
                height: `${BOX_DIM}px`,
                margin: `${MARGIN}px`,
            }}>
        </div>
    }

    render() {
        const { grid } = this.state;
        return (
            <div>
                <h1> Visualize Path Finding Algorithms at Work</h1>
                <button onClick={() => this.resetPath()}>Generate New Grid</button>
                <label>Select Path Finding Algorithm: </label>
                <select className="m-2" id="algorithm">
                    {this.createSelection()}
                </select>
                <button id="startButton" onClick={() => this.animatePath()}>Find Path</button>
                <div className="array-container">
                    {grid.map(g => this.renderTheGrid(g))}
                </div>
            </div>
        );
    }
}

// function generateTwoUniquePoints() {
//     let min = 0;
//     let xS = [];
//     let yS = [];
//     let points;
//     for (let i = 0; i < 2; i++) {
//         xS.push(Math.floor(Math.random() * (NUMBER_OF_BOXES_WIDTH - min) + min));
//         yS.push(Math.floor(Math.random() * (NUMBER_OF_BOXES_HEIGHT - min) + min));
//     }
//     if (xS[0] === xS[1] && yS[0] === yS[1]) {
//         points = generateTwoUniquePoints();
//     } else {
//         points = {startX: xS[0], startY: yS[0], endX: xS[1], endY: yS[1]};
//     }
//     return points;
// }