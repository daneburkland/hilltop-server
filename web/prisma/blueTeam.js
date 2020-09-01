const blueAdminApiKeyData = {
  // x-api-key: 'b48fa64de97e0887a86347c7ba94c78911763c0a80054d02c0f4de80042a33a3'
  hashed: '802577d50e8e0228fe479592ccc7e1974028d4662337367518f2a05e5d6192dc',
  prefix: 'foo',
}
const blueAdminFlow1Data = {
  title: "Blue admin's first flow",
  code: 'Foo',
}
const blueTeamData = { name: 'Blue team' }
exports.blueAdminData = {
  name: 'Blue Admin',
  id: 'auth0|5f4e4f3c0e634f006d229826',
  email: 'admin@blue.blue',
  team: { create: blueTeamData },
  apiKey: { create: blueAdminApiKeyData },
  // flows: {
  //   create: [blueAdminFlow1Data],
  // },
}

const blueTeammateApiKeyData = {
  // x-api-key: 'a35183c3b634df453f1cfe0b34d8f83844d1460b6873f0f03550f100123cc5f2'
  hashed: 'bd3f2f07b7c60ae81b39d4d4c83214a8263451cbd7104df2517b913d8be5e148',
  prefix: 'foo',
}
const blueTeammateFlow1Data = {
  title: "Blue teammate's first test",
  code: 'Foo',
}
exports.blueTeammateData = {
  name: 'Blue Teammate',
  id: 'blueTeammate',
  email: 'teammate@blue.blue',
  team: { create: blueTeamData },
  apiKey: { create: blueTeammateApiKeyData },
  // flows: {
  //   create: [blueTeammateFlow1Data],
  // },
}
