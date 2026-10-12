import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Card from './Card'

const user = {
    id: 'test-profile',
    name: 'Test Developer',
    img: '',
    email: '',
    jobTitle: 'Developer',
    location: { city: '', state: '', country: '' },
    links: { website: '', github: '', linkedin: '' },
}

let container: HTMLDivElement
let root: Root

describe('Card fallback avatar', () => {
    beforeEach(() => {
        vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
        container = document.createElement('div')
        document.body.appendChild(container)
        root = createRoot(container)
    })

    afterEach(() => {
        act(() => root.unmount())
        container.remove()
        vi.unstubAllGlobals()
    })

    it('uses a decorative theme-aware SVG when no photo is provided', () => {
        act(() => root.render(<Card user={user} />))
        const avatar = container.querySelector('svg.photo--fallback')
        // Decorative: the name is announced once, by the heading
        expect(avatar?.getAttribute('aria-hidden')).toBe('true')
        expect(avatar?.hasAttribute('role')).toBe(false)
        expect(container.querySelector('h2')?.textContent).toBe(user.name)
        expect(avatar?.querySelector('path')).not.toBeNull()
        expect(container.querySelector('img.photo')).toBeNull()
    })

    it('preserves profile photos and falls back when they fail to load', () => {
        act(() => root.render(<Card user={{ ...user, img: 'photo.jpg' }} />))
        const photo = container.querySelector('img.photo')
        expect(photo?.getAttribute('src')).toBe('photo.jpg')
        expect(container.querySelector('.photo--fallback')).toBeNull()

        act(() => photo?.dispatchEvent(new Event('error')))
        expect(container.querySelector('svg.photo--fallback')).not.toBeNull()
        expect(container.querySelector('img.photo')).toBeNull()
    })

    it('tries a replacement photo after the previous photo failed', () => {
        act(() => root.render(<Card user={{ ...user, img: 'broken.jpg' }} />))
        act(() =>
            container
                .querySelector('img.photo')
                ?.dispatchEvent(new Event('error'))
        )
        act(() =>
            root.render(<Card user={{ ...user, img: 'replacement.jpg' }} />)
        )
        expect(container.querySelector('img.photo')?.getAttribute('src')).toBe(
            'replacement.jpg'
        )
        expect(container.querySelector('.photo--fallback')).toBeNull()
    })
})
