const redAdminApiKeyData = {
  // x-api-key: '9eb8f25c27304e9bcd46fd95523f27d9ed31564d2555faaf01304462ae7b728b'
  hashed: 'ba3bdf92e0b67b68d36c8d5c92d077ebabb9bab666ee0e3db0f104a2ea831734',
  prefix: 'foo',
}
const redAdminFlow1Data = {
  title: "red admin's first flow",
  code: 'Foo',
}
const redTeamData = { name: 'red team' }
exports.redAdminData = {
  name: 'red Admin',
  id: 'redAdmin',
  email: 'admin@red.red',
  team: { create: redTeamData },
  apiKey: { create: redAdminApiKeyData },
  // flows: {
  //   create: [redAdminFlow1Data],
  // },
}

const redTeammateApiKeyData = {
  // x-api-key: 'd07a985519a34df42be32af6b3183dfec39b8100fdf6c810941254145e29a9df'
  hashed: '1e7883ca5478b7917040a827ee78bcc872ab8e56f18ea410b520252f10e8261a',
  prefix: 'foo',
}
const redTeammateFlow1Data = {
  title: "red teammate's first test",
  code: 'Foo',
}
exports.redTeammateData = {
  name: 'red Teammate',
  id: 'redTeammate',
  email: 'teammate@red.red',
  team: { create: redTeamData },
  apiKey: { create: redTeammateApiKeyData },
  // flows: {
  //   create: [redTeammateFlow1Data],
  // },
}
