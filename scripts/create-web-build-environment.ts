import { serializeWebBuildEnvironment } from "../web/buildEnvironment";

process.stdout.write(serializeWebBuildEnvironment(process.env));
