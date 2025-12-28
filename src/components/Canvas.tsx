import React, { useRef, useEffect } from 'react'

const Canvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(10, 10, 5, 0, 2 * Math.PI)
        ctx.strokeStyle = 'rgb(500,0,0)'
        ctx.stroke()
        ctx.fillStyle = 'rgb(500,0,0)'
        ctx.fillRect(9, 15, 3, 10)
    }, [])

    return <canvas ref={canvasRef} />
}

export default Canvas
