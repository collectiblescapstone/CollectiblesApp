export const capitalizeWord = (word: string) => {
    if (!word) return word
    return word.replace(
        /(^|\(|\s)([a-z])/g,
        (_, prefix, letter) => prefix + letter.toUpperCase()
    )
}

export const capitalizeEachWord = (sentence: string) => {
    return sentence
        .split(' ')
        .map((word) => capitalizeWord(word))
        .join(' ')
}
