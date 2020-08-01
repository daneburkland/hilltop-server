import { makeSchema } from '@nexus/schema'
import { nexusSchemaPrisma } from 'nexus-plugin-prisma/schema'
import * as types from './types'
import * as path from 'path'

export default (() => {
  try {
    return makeSchema({
      types,
      plugins: [nexusSchemaPrisma()],
      shouldExitAfterGenerateArtifacts: process.argv.includes('--nexus-exit'),
      outputs: {
        schema: path.join(__dirname, './../schema.graphql'),
        typegen: path.join(__dirname, './generated/nexus.ts'),
      },
    })
  } catch (e) {
    console.error(e)
  }
})()
