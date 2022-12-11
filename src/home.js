import React from "react";
import './App.css';

export default class Home extends React.Component {

    render() {
        return (
            <div>
                <h1>Algorithm Viewer Project</h1>

                <p>Hi! Welcome to my Algorithm Viewer Project.
                    The goal of this project is not to demonstrate a pretty styled frontend, but rather to visualize how coding concepts that are usually implemented only in the backend work.
                </p>

                <p>This project was developed using React app to visualize different algorithms.</p>

                <h2>List of Challenges Completed:</h2>

                <h3>Sorting Visualizations</h3>
                <div className="list">
                    <ul>
                        <li>Merge Sort</li>
                        <li>Quick Sort</li>
                        <li>Selection Sort</li>
                        <li>Insertion Sort</li>
                        <li>Bead Sort (Gravity Sort)</li>
                    </ul>
                </div>
                <h3>Path Finding Visualization with A*</h3>
                <h3>Fourier Transform Visualization</h3>
                <p>Draw anything and have it drawn back to you using Fourier Transorms to define every continuous line.</p>
                <h3>Smart Rockets (Evolutionary Algorithm)</h3>
                <p>Rockets that evolve from generation to generation as they try to make it to their landing zone without crashing.</p>
            </div>
        );
    }
}
