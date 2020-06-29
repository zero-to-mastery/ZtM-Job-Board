export default interface Person {
    id: string,
    img: string,
    name: string,
    jobTitle: string,
    location: {
        city?: string,
        state?: string,
        country?: string
    },
    links: {
        website?: string,
        linkedin?: string,
        github?: string
    }
}