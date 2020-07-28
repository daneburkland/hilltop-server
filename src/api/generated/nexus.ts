/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */

import * as Context from "../../context"



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
  LogWhereUniqueInput: { // input type
    id?: number | null; // Int
  }
  TestOrderByInput: { // input type
    updatedAt?: string | null; // String
  }
  TestRunWhereUniqueInput: { // input type
    id?: number | null; // Int
  }
}

export interface NexusGenEnums {
}

export interface NexusGenRootTypes {
  ApiKey: { // root type
    hashed: string; // String!
    prefix: string; // String!
    userId: string; // String!
  }
  GeneratedApiKey: { // root type
    key: string; // String!
    prefix: string; // String!
  }
  Log: { // root type
    hostname: string; // String!
    id: number; // Int!
    level: number; // Int!
    msg: string; // String!
    pid: number; // Int!
    stack?: string | null; // String
    time: any; // DateTime!
  }
  Mutation: {};
  Query: {};
  Test: { // root type
    code: string; // String!
    createdAt: any; // DateTime!
    id: number; // Int!
    title: string; // String!
    updatedAt: any; // DateTime!
  }
  TestRun: { // root type
    createdAt: any; // DateTime!
    id: number; // Int!
    result: string; // String!
    screenshotUrls: string[]; // [String!]!
  }
  User: { // root type
    email: string; // String!
    id: string; // String!
    name?: string | null; // String
  }
  String: string;
  Int: number;
  Float: number;
  Boolean: boolean;
  ID: string;
  DateTime: any;
}

export interface NexusGenAllTypes extends NexusGenRootTypes {
  LogWhereUniqueInput: NexusGenInputs['LogWhereUniqueInput'];
  TestOrderByInput: NexusGenInputs['TestOrderByInput'];
  TestRunWhereUniqueInput: NexusGenInputs['TestRunWhereUniqueInput'];
}

export interface NexusGenFieldTypes {
  ApiKey: { // field return type
    hashed: string; // String!
    prefix: string; // String!
    userId: string; // String!
  }
  GeneratedApiKey: { // field return type
    key: string; // String!
    prefix: string; // String!
  }
  Log: { // field return type
    hostname: string; // String!
    id: number; // Int!
    level: number; // Int!
    msg: string; // String!
    pid: number; // Int!
    stack: string | null; // String
    testRun: NexusGenRootTypes['TestRun']; // TestRun!
    time: any; // DateTime!
  }
  Mutation: { // field return type
    createTest: NexusGenRootTypes['Test']; // Test!
  }
  Query: { // field return type
    myTests: NexusGenRootTypes['Test'][]; // [Test!]!
    test: NexusGenRootTypes['Test']; // Test!
    testRun: NexusGenRootTypes['TestRun']; // TestRun!
  }
  Test: { // field return type
    author: NexusGenRootTypes['User'] | null; // User
    code: string; // String!
    createdAt: any; // DateTime!
    id: number; // Int!
    runs: NexusGenRootTypes['TestRun'][]; // [TestRun!]!
    title: string; // String!
    updatedAt: any; // DateTime!
  }
  TestRun: { // field return type
    createdAt: any; // DateTime!
    id: number; // Int!
    logs: NexusGenRootTypes['Log'][]; // [Log!]!
    result: string; // String!
    screenshotUrls: string[]; // [String!]!
    test: NexusGenRootTypes['Test']; // Test!
  }
  User: { // field return type
    email: string; // String!
    id: string; // String!
    name: string | null; // String
  }
}

export interface NexusGenArgTypes {
  Mutation: {
    createTest: { // args
      code: string; // String!
      title: string; // String!
    }
  }
  Query: {
    myTests: { // args
      orderBy?: NexusGenInputs['TestOrderByInput'] | null; // TestOrderByInput
    }
    test: { // args
      id?: number | null; // Int
    }
    testRun: { // args
      id?: number | null; // Int
    }
  }
  Test: {
    runs: { // args
      after?: NexusGenInputs['TestRunWhereUniqueInput'] | null; // TestRunWhereUniqueInput
      before?: NexusGenInputs['TestRunWhereUniqueInput'] | null; // TestRunWhereUniqueInput
      first?: number | null; // Int
      last?: number | null; // Int
    }
  }
  TestRun: {
    logs: { // args
      after?: NexusGenInputs['LogWhereUniqueInput'] | null; // LogWhereUniqueInput
      before?: NexusGenInputs['LogWhereUniqueInput'] | null; // LogWhereUniqueInput
      first?: number | null; // Int
      last?: number | null; // Int
    }
  }
}

export interface NexusGenAbstractResolveReturnTypes {
}

export interface NexusGenInheritedFields {}

export type NexusGenObjectNames = "ApiKey" | "GeneratedApiKey" | "Log" | "Mutation" | "Query" | "Test" | "TestRun" | "User";

export type NexusGenInputNames = "LogWhereUniqueInput" | "TestOrderByInput" | "TestRunWhereUniqueInput";

export type NexusGenEnumNames = never;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = "Boolean" | "DateTime" | "Float" | "ID" | "Int" | "String";

export type NexusGenUnionNames = never;

export interface NexusGenTypes {
  context: Context.Context;
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