import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
    return {
        base: '',
        build: {
            outDir: 'build',
        },
        server: {
            port: 3000,
        },
        plugins: [react()],
    }
})
