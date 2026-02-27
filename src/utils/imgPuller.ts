const imgPuller: (folder: string, img: string) => string = (
    folder: string,
    img: string
) => {
    return `/Assets/img/${folder}/${img}.png`
}

export default imgPuller
