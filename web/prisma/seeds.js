const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const main = async () => {
  const flowExecuted = await prisma.event.create({
    data: {
      noun: 'Flow',
      verb: 'executed',
    },
  })

  const flowErrored = await prisma.event.create({
    data: {
      noun: 'Flow',
      verb: 'errored',
    },
  })

  console.log(flowExecuted, flowErrored)
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.disconnect()
  })
