import { describe, expect, test } from 'vitest'
import { validateSubmission } from './validate-submission.mjs'
const validSubmission = {
    name: 'Test Developer',
    jobTitle: 'Full Stack Developer',
    links: {
        website: '',
        linkedin: '',
        github: '',
    },
    location: {
        city: '',
        state: '',
        country: 'India',
    },
}
describe('validateSubmission', () => {
    test('accepts a valid submission', () => {
        expect(validateSubmission(validSubmission, 'valid.json')).toEqual([])
    })
    test('rejects a missing name', () => {
        const { name, ...data } = validSubmission
        expect(validateSubmission(data, 'missing-name.json')).toContain(
            'missing-name.json: "name" is required and must be a nonblank string'
        )
    })
    test('rejects a non-object submission', () => {
        expect(validateSubmission([], 'array.json')).toContain(
            'array.json: submission must be a JSON object'
        )
    })
    test('rejects incorrect nested field types', () => {
        const data = {
            ...validSubmission,
            links: { github: 123 },
            location: { country: false },
        }
        expect(validateSubmission(data, 'invalid.json')).toEqual([
            'invalid.json: "links.github" must be a string when provided',
            'invalid.json: "location.country" must be a string when provided',
        ])
    })
    test('rejects missing links and location', () => {
        expect(
            validateSubmission({ name: 'Developer' }, 'missing-fields.json')
        ).toEqual([
            'missing-fields.json: "links" is required and must be an object',
            'missing-fields.json: "location" is required and must be an object',
        ])
    })
    test('accepts optional fields being absent', () => {
        expect(
            validateSubmission({
                name: 'Developer',
                links: {},
                location: {},
            })
        ).toEqual([])
    })
    test('allows flexible job titles and country names', () => {
        expect(
            validateSubmission({
                name: 'Developer',
                jobTitle: 'AI Researcher / Open to Opportunities',
                links: {},
                location: { country: 'USA/Belgium' },
            })
        ).toEqual([])
    })
    test('rejects invalid skills', () => {
        expect(
            validateSubmission(
                {
                    name: 'Developer',
                    links: {},
                    location: {},
                    skills: ['React', ''],
                },
                'skills.json'
            )
        ).toContain(
            'skills.json: "skills" must be an array of nonblank strings'
        )
    })
})
