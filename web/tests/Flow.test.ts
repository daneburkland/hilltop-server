import { createTestContext } from './__helpers'

const ctx = createTestContext()
console.log('ctx', ctx)

it('ensures that a flow can be created', async () => {
  // ...
  // Publish the previously created draft
  const flowResult = await ctx.client.send(
    `
    mutation createFlow($title: String!, $code: String!) {
        createFlow(title: $title, code: $code) {
          id
          title
        }
      }
    `,
  )
  //   console.log('flowResult', JSON.stringify(flowResult))
  //   // Snapshot the published draft and expect `published` to be true
  //   expect(flowResult).toMatchInlineSnapshot(`
  //       Object {
  //         "createFlow": Object {
  //           "body": "...",
  //           "id": 1,
  //           "code": "Bar",
  //           "title": "Foo",
  //         },
  //       }
  //     `)
  //   const persistedData = await ctx.app.db.client.flow.findMany()
  //   expect(persistedData).toMatchInlineSnapshot()
})
