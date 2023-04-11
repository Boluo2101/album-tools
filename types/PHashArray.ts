interface PHashArrayItem {
  index: number
  pHash: string
  indexs?: number[]
}

interface PHashArrayItemReturn {
  index: number
  indexs: number[]
  title: string
  description: string
}

export { PHashArrayItemReturn, PHashArrayItem }
export default PHashArrayItem