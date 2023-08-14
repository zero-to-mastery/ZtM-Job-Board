export default interface Person {
    id: string
    img: string
    name: string
    email?: string
    jobTitle: string
    isOpenToWork?: boolean
    location: {
        city?: string
        state?: string
        country?: string
    }
    links: {
        website?: string
        linkedin?: string
        github?: string
    }
}
