import { PrismaClient } from '@prisma/client'
import { prisma } from './db'
import { ContextParameters } from 'graphql-yoga/dist/types'

export interface Context {
  prisma: PrismaClient
  request: any
}

export function createContext(request: ContextParameters) {
  return {
    ...request,
    prisma,
  }
}
