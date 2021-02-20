const allHanzi = (str) => {
  for (i = 0; i < str.length; i++) {
    if (str.codePointAt(i) < 256)  return false
  }
  return true
}

module.exports = { allHanzi }