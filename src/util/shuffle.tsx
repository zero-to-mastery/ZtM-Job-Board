//Durstenfeld shuffle algorithm, a computer-optimized version of Fisher-Yates
//algorithm works by picking one random element for each original array element, and then //excluding it from the next draw. swapping the picked element with the current element, ///and then picking the next random element from the remainder.
//note: shuffle function is not pure function, it mutates original array
//in order to avoid memory duplication
export const shuffle = (array: any) => {
    const isOpenToWork = (item: any) =>
        item.hasOwnProperty('isOpenToWork') && item.isOpenToWork === true

    const openToWork = array.filter(isOpenToWork)
    const notOpenToWork = array.filter((item: any) => !isOpenToWork(item))

    const shuffledOpenToWork = openToWork.sort(() => Math.random() - 0.5)
    const shuffledNotOpenToWork = notOpenToWork.sort(() => Math.random() - 0.5)

    return [...shuffledOpenToWork, ...shuffledNotOpenToWork]
}
