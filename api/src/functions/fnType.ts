import { AWS } from "@serverless/typescript";

export type FnType = NonNullable<AWS["functions"]> extends { [K: string]: infer R } ? R : never;
