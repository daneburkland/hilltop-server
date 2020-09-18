const { PrismaClient } = require('@prisma/client')
const { blueAdminData, blueTeammateData } = require('./blueTeam')
const { redAdminData, redTeammateData } = require('./redTeam')

const prisma = new PrismaClient()

main = async () => {
  const flowExecuted = await prisma.event.upsert({
    where: {
      noun_verb: {
        noun: 'Flow',
        verb: 'executed',
      },
    },
    create: {
      noun: 'Flow',
      verb: 'executed',
    },
    update: {},
  })

  const flowErrored = await prisma.event.upsert({
    where: {
      noun_verb: {
        noun: 'Flow',
        verb: 'errored',
      },
    },
    create: {
      noun: 'Flow',
      verb: 'errored',
    },
    update: {},
  })

  // USERS
  const users = [blueAdminData, blueTeammateData, redAdminData, redTeammateData]

  const persistedUsers = await Promise.all(
    users.map((user) => {
      return prisma.user.create({
        data: user,
      })
    }),
  )

  console.log('disconnecting seed prisma')
  await prisma.$disconnect()

  console.log(flowExecuted, flowErrored, ...persistedUsers)
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    console.log('disconnecting seed prisma')
    await prisma.$disconnect()
  })
