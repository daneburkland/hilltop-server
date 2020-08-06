import { makeSchema } from '@nexus/schema'
import { nexusSchemaPrisma } from 'nexus-plugin-prisma/schema'
import * as types from './types/index'

export const schema = makeSchema({
  types,
  plugins: [nexusSchemaPrisma({ experimentalCRUD: true })],
})
