import finder from 'find-package-json'

let f = finder(__dirname)
f.next() // our is not interesting
const packageJson = f.next().value || {}

export default packageJson
