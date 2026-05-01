// @ts-ignore
import PorterStemmerRu from 'natural/lib/natural/stemmers/porter_stemmer_ru'

const VOLUME_WEIGHT = 0.4
const DIVERSITY_WEIGHT = 0.4
const DESCRIPTIVE_WEIGHT = 0.2

const isAdjective = (word: string): boolean => {
  const adjRegExp = /(ая|ое|ые|ие|ый|ой|ий|ый|ого|его|ому|ему|ую|юю|ым|им|ом|ем)$/i
  return adjRegExp.test(word) && word.length > 3
}

const isStopWord = (word: string): boolean => {
  const stopWords = new Set(['и', 'в', 'во', 'не', 'на', 'с', 'со', 'но', 'а', 'как', 'то', 'же', 'от', 'до'])
  return stopWords.has(word) || word.length <= 2
}

export const calculateWordsRate = (inputText: string, targetCount: number): number => {
  if (!inputText?.trim())
    return 0

  const uniqueStems = new Set<string>()
  let meaningfulWordsCount = 0
  let adjectivesCount = 0

  const words = inputText.toLowerCase().match(/[а-яё]+/gi) || []
  words.forEach(word => {
    if (isStopWord(word))
      return

    const stem = PorterStemmerRu.stem(word)
    uniqueStems.add(stem)

    meaningfulWordsCount++
    if (isAdjective(word)) {
      adjectivesCount++
    }
  })

  if (meaningfulWordsCount === 0)
    return 0

  const volumeRate = meaningfulWordsCount / targetCount
  const diversityRate = uniqueStems.size / targetCount
  const descriptiveRate = adjectivesCount / targetCount

  const wordsRate =
    volumeRate * VOLUME_WEIGHT +
    diversityRate * DIVERSITY_WEIGHT +
    descriptiveRate * DESCRIPTIVE_WEIGHT

  return Math.min(wordsRate, 1)
}