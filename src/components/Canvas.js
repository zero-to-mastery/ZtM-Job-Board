import React,{Component} from 'react';


class Canvas extends Component {
    constructor () {
        super()
        this.canvasRef = React.createRef();
    }

    componentDidMount () {
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.arc(10, 10, 5, 0, 2 * Math.PI);
        ctx.strokeStyle='rgb(500,0,0)'
        ctx.stroke();
        ctx.fillStyle='rgb(500,0,0)';
        ctx.fillRect(9,15,3,10)
    }

    render () {
        return (
            <canvas ref={this.canvasRef} />
        );
    }
}

export default Canvas;