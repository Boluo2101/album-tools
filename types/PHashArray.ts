interface PHashArrayItem {
  index: number
  pHash: string
  indexs?: number[]
}

interface PHashArrayItemReturn {
  index: number
  indexs: number[]
}

export { PHashArrayItemReturn, PHashArrayItem }
export default PHashArrayItem