// The all-the-cities package ships without type declarations.
declare module 'all-the-cities' {
    const cities: {
        cityId: number
        name: string
        altName: string
        country: string
        adminCode: string
        population: number
        loc: { coordinates: [number, number] }
    }[]
    export default cities
}
