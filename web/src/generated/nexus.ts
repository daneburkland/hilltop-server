/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */





declare global {
  interface NexusGenCustomOutputProperties<TypeName extends string> {
    model: NexusPrisma<TypeName, 'model'>
    crud: any
  }
}

declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  EventWhereUniqueInput: { // input type
    id?: number | null; // Int
  }
  FlowOrderByInput: { // input type
    updatedAt?: string | null; // String
  }
  FlowRunOrderByInput: { // input type
    createdAt?: string | null; // String
  }
  FlowRunWhereUniqueInput: { // input type
    id?: number | null; // Int
  }
  LogWhereUniqueInput: { // input type
    id?: number | null; // Int
  }
  UserWhereUniqueInput: { // input type
    email?: string | null; // String
    id?: string | null; // String
  }
}

export interface NexusGenEnums {
  Noun: "Flow"
  Verb: "created" | "errored" | "executed" | "updated"
}

export interface NexusGenRootTypes {
  ApiKey: { // root type
    hashed: string; // String!
    prefix: string; // String!
    userId: string; // String!
  }
  Event: { // root type
    id: number; // Int!
    noun: NexusGenEnums['Noun']; // Noun!
    verb: NexusGenEnums['Verb']; // Verb!
  }
  Flow: { // root type
    code: string; // String!
    createdAt: any; // DateTime!
    id: number; // Int!
    title: string; // String!
    updatedAt: any; // DateTime!
  }
  FlowRun: { // root type
    createdAt: any; // DateTime!
    id: number; // Int!
    result: string; // String!
    screenshotUrls: string[]; // [String!]!
  }
  GeneratedApiKey: { // root type
    key: string; // String!
    prefix: string; // String!
  }
  Log: { // root type
    id: number; // Int!
    level: string; // String!
    msg: string; // String!
    stack?: string | null; // String
  }
  Mutation: {};
  Query: {};
  Team: { // root type
    id: number; // Int!
    name: string; // String!
  }
  User: { // root type
    email: string; // String!
    id: string; // String!
    name: string; // String!
  }
  Webhook: { // root type
    id: number; // Int!
    resource: string; // String!
    url: string; // String!
  }
  String: string;
  Int: number;
  Float: number;
  Boolean: boolean;
  ID: string;
  DateTime: any;
}

export interface NexusGenAllTypes extends NexusGenRootTypes {
  EventWhereUniqueInput: NexusGenInputs['EventWhereUniqueInput'];
  FlowOrderByInput: NexusGenInputs['FlowOrderByInput'];
  FlowRunOrderByInput: NexusGenInputs['FlowRunOrderByInput'];
  FlowRunWhereUniqueInput: NexusGenInputs['FlowRunWhereUniqueInput'];
  LogWhereUniqueInput: NexusGenInputs['LogWhereUniqueInput'];
  UserWhereUniqueInput: NexusGenInputs['UserWhereUniqueInput'];
  Noun: NexusGenEnums['Noun'];
  Verb: NexusGenEnums['Verb'];
}

export interface NexusGenFieldTypes {
  ApiKey: { // field return type
    hashed: string; // String!
    prefix: string; // String!
    userId: string; // String!
  }
  Event: { // field return type
    id: number; // Int!
    noun: NexusGenEnums['Noun']; // Noun!
    verb: NexusGenEnums['Verb']; // Verb!
    webhook: NexusGenRootTypes['Webhook'] | null; // Webhook
  }
  Flow: { // field return type
    author: NexusGenRootTypes['User']; // User!
    code: string; // String!
    createdAt: any; // DateTime!
    id: number; // Int!
    runs: NexusGenRootTypes['FlowRun'][]; // [FlowRun!]!
    title: string; // String!
    updatedAt: any; // DateTime!
  }
  FlowRun: { // field return type
    createdAt: any; // DateTime!
    flow: NexusGenRootTypes['Flow']; // Flow!
    id: number; // Int!
    logs: NexusGenRootTypes['Log'][]; // [Log!]!
    result: string; // String!
    screenshotUrls: string[]; // [String!]!
  }
  GeneratedApiKey: { // field return type
    key: string; // String!
    prefix: string; // String!
  }
  Log: { // field return type
    id: number; // Int!
    level: string; // String!
    msg: string; // String!
    run: NexusGenRootTypes['FlowRun']; // FlowRun!
    stack: string | null; // String
  }
  Mutation: { // field return type
    createFlow: NexusGenRootTypes['Flow']; // Flow!
    createWebhook: NexusGenRootTypes['Webhook']; // Webhook!
    generateApiKey: NexusGenRootTypes['GeneratedApiKey']; // GeneratedApiKey!
    inviteTeammate: NexusGenRootTypes['User']; // User!
    login: NexusGenRootTypes['User']; // User!
    updateFlow: NexusGenRootTypes['Flow']; // Flow!
  }
  Query: { // field return type
    flow: NexusGenRootTypes['Flow']; // Flow!
    flowRun: NexusGenRootTypes['FlowRun']; // FlowRun!
    flowRuns: NexusGenRootTypes['FlowRun'][]; // [FlowRun!]!
    myFlows: NexusGenRootTypes['Flow'][]; // [Flow!]!
    user: NexusGenRootTypes['User']; // User!
  }
  Team: { // field return type
    id: number; // Int!
    members: NexusGenRootTypes['User'][]; // [User!]!
    name: string; // String!
  }
  User: { // field return type
    email: string; // String!
    id: string; // String!
    name: string; // String!
    team: NexusGenRootTypes['Team']; // Team!
  }
  Webhook: { // field return type
    events: NexusGenRootTypes['Event'][]; // [Event!]!
    id: number; // Int!
    owner: NexusGenRootTypes['Team']; // Team!
    resource: string; // String!
    url: string; // String!
  }
}

export interface NexusGenArgTypes {
  Flow: {
    runs: { // args
      after?: NexusGenInputs['FlowRunWhereUniqueInput'] | null; // FlowRunWhereUniqueInput
      before?: NexusGenInputs['FlowRunWhereUniqueInput'] | null; // FlowRunWhereUniqueInput
      first?: number | null; // Int
      last?: number | null; // Int
    }
  }
  FlowRun: {
    logs: { // args
      after?: NexusGenInputs['LogWhereUniqueInput'] | null; // LogWhereUniqueInput
      before?: NexusGenInputs['LogWhereUniqueInput'] | null; // LogWhereUniqueInput
      first?: number | null; // Int
      last?: number | null; // Int
    }
  }
  Mutation: {
    createFlow: { // args
      code: string; // String!
      title: string; // String!
    }
    createWebhook: { // args
      onCreate: boolean; // Boolean!
      onExecute: boolean; // Boolean!
      resource: string; // String!
      url: string; // String!
    }
    inviteTeammate: { // args
      email: string; // String!
    }
    login: { // args
      email: string; // String!
      name: string; // String!
    }
    updateFlow: { // args
      code: string; // String!
      id: number; // Int!
      run?: boolean | null; // Boolean
      title: string; // String!
    }
  }
  Query: {
    flow: { // args
      id?: number | null; // Int
    }
    flowRun: { // args
      id?: number | null; // Int
    }
    flowRuns: { // args
      id?: number | null; // Int
      orderBy?: NexusGenInputs['FlowRunOrderByInput'] | null; // FlowRunOrderByInput
    }
    myFlows: { // args
      orderBy?: NexusGenInputs['FlowOrderByInput'] | null; // FlowOrderByInput
    }
  }
  Team: {
    members: { // args
      after?: NexusGenInputs['UserWhereUniqueInput'] | null; // UserWhereUniqueInput
      before?: NexusGenInputs['UserWhereUniqueInput'] | null; // UserWhereUniqueInput
      first?: number | null; // Int
      last?: number | null; // Int
    }
  }
  Webhook: {
    events: { // args
      after?: NexusGenInputs['EventWhereUniqueInput'] | null; // EventWhereUniqueInput
      before?: NexusGenInputs['EventWhereUniqueInput'] | null; // EventWhereUniqueInput
      first?: number | null; // Int
      last?: number | null; // Int
    }
  }
}

export interface NexusGenAbstractResolveReturnTypes {
}

export interface NexusGenInheritedFields {}

export type NexusGenObjectNames = "ApiKey" | "Event" | "Flow" | "FlowRun" | "GeneratedApiKey" | "Log" | "Mutation" | "Query" | "Team" | "User" | "Webhook";

export type NexusGenInputNames = "EventWhereUniqueInput" | "FlowOrderByInput" | "FlowRunOrderByInput" | "FlowRunWhereUniqueInput" | "LogWhereUniqueInput" | "UserWhereUniqueInput";

export type NexusGenEnumNames = "Noun" | "Verb";

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = "Boolean" | "DateTime" | "Float" | "ID" | "Int" | "String";

export type NexusGenUnionNames = never;

export interface NexusGenTypes {
  context: any;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  allTypes: NexusGenAllTypes;
  inheritedFields: NexusGenInheritedFields;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractResolveReturn: NexusGenAbstractResolveReturnTypes;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
}