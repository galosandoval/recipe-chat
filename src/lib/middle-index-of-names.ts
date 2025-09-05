export function middleIndexOfNames(data: { name: string }[]) {
  let charsSplit = data
    .map((f) => f.name)
    .join('_')
    .split('')
  const middleIdx = Math.floor(charsSplit.length / 2)

  let left = middleIdx
  let right = middleIdx + 1
  let index = middleIdx

  while (left > 0 && right < charsSplit.length) {
    const leftChar = charsSplit[left]
    const rightChar = charsSplit[right]

    if (leftChar != '_') {
      left--
    }
    if (rightChar != '_') {
      right++
    }
    if (leftChar == '_' && rightChar == '_') {
      const leftLength = left
      const rightLength = charsSplit.length - right
      const addToLeft = leftLength < rightLength
      // this cuts out the underscores
      const middleName = charsSplit.slice(left + 1, right).join('')

      data.forEach((f, i) => {
        if (f.name == middleName) {
          index = addToLeft ? i + 1 : i
        }
      })

      break
    }
  }

  return index
}
