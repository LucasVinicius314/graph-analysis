import * as fs from 'fs'

import { Vertex } from './typescript'
import { createInterface } from 'readline'

// Flag set to auto load a test file.
const autoFileLoading: boolean = false

// Flag set to test the current node environment.
const isDebug = process.env.NODE_ENV === 'dev'

// Promise that collects the target file's path from the standard input stream.
const getFileName = () =>
  new Promise<string>((resolve, reject) => {
    const input = createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    input.question('File path to be read:', (out) => {
      input.close()

      resolve(out)
    })
  })

// Promise that collects the target vertex's index from the standard input stream.
const getVertexAtIndex = () =>
  new Promise<number>((resolve, reject) => {
    if (isDebug) {
      resolve(1)

      return
    }

    const input = createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    const question = () => {
      input.question('Graph point index to be analysed:', (out) => {
        try {
          const value = parseInt(out)

          input.close()

          resolve(value)
        } catch (error) {
          console.warn('Unexpected number format.')

          question()
        }
      })
    }

    question()
  })

// The program's entry point.
const main = async () => {
  try {
    // Default target file's path.
    let filePath = 'assets/graph-test-100.txt'

    if (!autoFileLoading) {
      filePath = await getFileName()
    }

    console.info(`Loading ${filePath}...`)

    // Read the target file's content.
    const fileData = fs.readFileSync(filePath, 'utf8')

    // Split on every line break.
    const edges = fileData.split('\n')

    // Split the first line, which contains info about the desired graph structure.
    const graphInfo = edges[0].split(' ')

    // Get the vertex count from graph info.
    const vertexCount = parseInt(graphInfo[0])

    // Populate the vertex map accordingly.
    const vertices = new Array(vertexCount + 1)
      .fill(true)
      .map<Vertex>((v, k) => ({
        index: k,
        successors: [],
        predecessors: [],
      }))

    // Iterate through the remainfing file entries.
    edges.slice(1).forEach((v) => {
      const match = v.match(/^\s*(\d+)\s*(\d+)\r$/)

      if (match == null) return

      const one = parseInt(match[1])
      const two = parseInt(match[2])

      vertices[one].successors.push(vertices[two])
      vertices[two].predecessors.push(vertices[one])
    })

    // Log the entire vertex map for debugging purposes.
    if (isDebug) {
      console.log(vertices)
    }

    // Get the target vertex's index.
    const vertexIndex = await getVertexAtIndex()

    // Get the target vertex from the vertex map.
    const targetVertex = vertices[vertexIndex]

    // Fetch successors.
    const successors = targetVertex.successors.map((v) => v.index).join(', ')
    // Fetch predecessors.
    const predecessors = targetVertex.predecessors
      .map((v) => v.index)
      .join(', ')

    // Build the info log.
    const messages = [
      `Info regarding vertex at index ${targetVertex.index}:`,
      `Negative degree: ${targetVertex.successors.length}`,
      `Positive degree: ${targetVertex.predecessors.length}`,
      `Successors: ${successors}`,
      `Predecessors: ${predecessors}`,
    ]

    console.info(messages.join('\n'))

    console.info('Finished.')
  } catch (err) {
    console.error(err)
  }
}

main()
