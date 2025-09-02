export function middleIndexOfNames(data: { name: string }[]) {
  let charsSplit = data
    .map((f) => f.name)
    .join('_')
    .split('')
  const middleIdx = Math.floor(charsSplit.length / 2)

  let middleName = ''
  let left = middleIdx
  let right = middleIdx
  let addToLeft = true
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
      addToLeft = leftLength < rightLength
      middleName = charsSplit.slice(left + 1, right).join('')
      break
    }
  }

  let index = -1
  data.forEach((f, i) => {
    if (f.name == middleName) {
      index = i
    }
  })
  return addToLeft ? index : index - 1
}
