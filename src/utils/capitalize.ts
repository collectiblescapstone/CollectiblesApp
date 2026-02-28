export const capitalizeWord = (word: string) => {
    if (!word) return word // Handles empty or null strings
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

export const capitalizeEachWord = (sentence: string) => {
    return sentence
        .split(' ') // Split the sentence into an array of words
        .map((word) => capitalizeWord(word)) // Capitalize each word using the function above
        .join(' ') // Join the words back into a sentence with spaces
}
