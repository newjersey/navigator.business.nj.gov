/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  allowedSeverity: "error",
  allowed: [
    {
      from: { path: "aws-amplify" },
      to: {},
    },
    {
      from: {},
      to: { path: "@serverless/typescript" },
    },
    {
      from: {},
      to: { path: "@aws-sdk/client-s3" },
    },
    {
      from: {},
      to: { path: "@aws-sdk/client-ssm" },
    },
    {
      from: {},
      to: { path: "@aws-sdk/util-dynamodb" },
    },
    {
      from: {},
      to: { path: "@aws-sdk/lib-dynamodb" },
    },
    {
      from: {},
      to: { path: "@aws-sdk/client-dynamodb" },
    },
    {
      from: {},
      to: { path: "@aws-crypto/client-node" },
    },
    {
      from: {},
      to: { path: "@aws-sdk/util-base64-node" },
    },
    {
      from: {},
      to: { path: "@smithy/node-http-handler" },
    },
    {
      from: {},
      to: { path: "util" },
    },
    {
      from: {},
      to: { path: "simple-oauth2" },
    },
    {
      from: {},
      to: { path: "body-parser" },
    },
    {
      from: {},
      to: { path: "supertest" },
    },
    {
      from: {},
      to: { path: "winston" },
    },
    {
      from: {},
      to: { path: "winston-cloudwatch" },
    },
    {
      from: { path: "src/db" },
      to: { path: "fs" },
    },
    {
      from: { path: "src/db" },
      to: { path: "path" },
    },
    {
      from: {},
      to: { path: "https" },
    },
    {
      from: {},
      to: { path: "xml2js" },
    },
    {
      from: {},
      to: { path: "express" },
    },
    {
      from: {},
      to: { path: "http-status-codes" },
    },
    {
      from: {},
      to: { path: "crypto" },
    },
    {
      from: {},
      to: { path: "dayjs" },
    },
    {
      from: {},
      to: { path: "airtable" },
    },
    {
      from: {},
      to: { path: "axios" },
    },
    {
      from: {},
      to: { path: "cors" },
    },
    {
      from: {},
      to: { path: "dedent" },
    },
    {
      from: {},
      to: { path: "jsonwebtoken" },
    },
    {
      from: {},
      to: { path: "serverless-http" },
    },
    {
      from: { path: "src/functions" },
      to: { path: "lodash" },
    },
    {
      from: { path: "src/api" },
      to: { path: "lodash" },
    },
    {
      from: {},
      to: { path: "lodash" },
    },
    {
      from: { path: "src/libs" },
      to: { path: "helmet" },
    },
    {
      from: {},
      to: { path: "../shared" },
    },
    {
      from: { path: "src/db" },
      to: { path: "src/db" },
    },
    {
      from: { path: "src/libs" },
      to: { path: "src/libs" },
    },
    {
      from: { path: "src/api" },
      to: { path: "src/api" },
    },
    {
      from: {},
      to: { path: "src/domain" },
    },
    {
      from: { path: "src/client" },
      to: { path: "src/client" },
    },
    {
      from: { path: "src/client" },
      to: { path: "src/libs" },
    },
    {
      from: { path: "src/functions" },
      to: { path: "src/" },
    },
    {
      from: { path: "../shared" },
      to: { path: "content" },
    },
    {
      from: { path: "../shared" },
      to: { path: "uuid" },
    },
    {
      from: { path: "src/db/migrations" },
      to: { path: "uuid" },
    },
    {
      from: {},
      to: { path: "test" },
    },

    {
      from: { path: "test" },
      to: {},
    },

    {
      from: { path: "src/client" },
      to: { path: "src/api" },
    },

    {
      from: { path: "src/domain" },
      to: { path: "src/api" },
    },
    {
      from: { path: "src/domain" },
      to: { path: "src/client" },
    },
    {
      from: { path: "src/db" },
      to: { path: "src/libs" },
    },
    {
      from: { path: "src/api" },
      to: { path: "src/libs" },
    },
  ],
  forbidden: [
    /* rules from the 'recommended' preset: */
    {
      name: "no-circular",
      severity: "error",
      comment:
        "This dependency is part of a circular relationship. You might want to revise " +
        "your solution (i.e. use dependency inversion, make sure the modules have a single responsibility) ",
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: "no-orphans",
      comment:
        "This is an orphan module - it's likely not used (anymore?). Either use it or " +
        "remove it. If it's logical this module is an orphan (i.e. it's a config file), " +
        "add an exception for it in your dependency-cruiser configuration. By default " +
        "this rule does not scrutinize dotfiles (e.g. .eslintrc.js), TypeScript declaration " +
        "files (.d.ts), tsconfig.json and some of the babel and webpack configs.",
      severity: "error",
      from: {
        orphan: true,
        pathNot: [
          "(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$", // dot files
          "\\.d\\.ts$", // TypeScript declaration files
          "(^|/)tsconfig\\.json$", // TypeScript config
          "(^|/)(babel|webpack)\\.config\\.(js|cjs|mjs|ts|json)$", // other configs,
          "(^|/)(setup|teardown)Tests\\.(js|cjs|mjs|ts|json)$", // jest configs
        ],
      },
      to: {},
    },
    {
      name: "no-deprecated-core",
      comment:
        "A module depends on a node core module that has been deprecated. Find an alternative - these are " +
        "bound to exist - node doesn't deprecate lightly.",
      severity: "error",
      from: {},
      to: {
        dependencyTypes: ["core"],
        path: [
          "^(v8/tools/codemap)$",
          "^(v8/tools/consarray)$",
          "^(v8/tools/csvparser)$",
          "^(v8/tools/logreader)$",
          "^(v8/tools/profile_view)$",
          "^(v8/tools/profile)$",
          "^(v8/tools/SourceMap)$",
          "^(v8/tools/splaytree)$",
          "^(v8/tools/tickprocessor-driver)$",
          "^(v8/tools/tickprocessor)$",
          "^(node-inspect/lib/_inspect)$",
          "^(node-inspect/lib/internal/inspect_client)$",
          "^(node-inspect/lib/internal/inspect_repl)$",
          "^(async_hooks)$",
          "^(punycode)$",
          "^(domain)$",
          "^(constants)$",
          "^(sys)$",
          "^(_linklist)$",
          "^(_stream_wrap)$",
        ],
      },
    },
    {
      name: "not-to-deprecated",
      comment:
        "This module uses a (version of an) npm module that has been deprecated. Either upgrade to a later " +
        "version of that module, or find an alternative. Deprecated modules are a security risk.",
      severity: "error",
      from: {},
      to: {
        dependencyTypes: ["deprecated"],
      },
    },
    {
      name: "no-non-package-json",
      severity: "error",
      comment:
        "This module depends on an npm package that isn't in the 'dependencies' section of your package.json. " +
        "That's problematic as the package either (1) won't be available on live (2 - worse) will be " +
        "available on live with an non-guaranteed version. Fix it by adding the package to the dependencies " +
        "in your package.json.",
      from: {},
      to: {
        dependencyTypes: ["npm-no-pkg", "npm-unknown"],
      },
    },
    {
      name: "not-to-unresolvable",
      comment:
        "This module depends on a module that cannot be found ('resolved to disk'). If it's an npm " +
        "module: add it to your package.json. In all other cases you likely already know what to do.",
      severity: "error",
      from: {},
      to: {
        couldNotResolve: true,
      },
    },
    {
      name: "no-duplicate-dep-types",
      comment:
        "Likeley this module depends on an external ('npm') package that occurs more than once " +
        "in your package.json i.e. bot as a devDependencies and in dependencies. This will cause " +
        "maintenance problems later on.",
      severity: "error",
      from: {},
      to: {
        moreThanOneDependencyType: true,
        // as it's pretty common to have a type import be a type only import
        // _and_ (e.g.) a devDependency - don't consider type-only dependency
        // types for this rule
        dependencyTypesNot: ["type-only"],
      },
    },

    /* rules you might want to tweak for your specific situation: */
    {
      name: "not-to-spec",
      comment:
        "This module depends on a spec (test) file. The sole responsibility of a spec file is to test code. " +
        "If there's something in a spec that's of use to other modules, it doesn't have that single " +
        "responsibility anymore. Factor it out into (e.g.) a separate utility/ helper or a mock.",
      severity: "error",
      from: {},
      to: {
        path: "\\.(spec|test)\\.(js|mjs|cjs|ts|ls|coffee|litcoffee|coffee\\.md)$",
      },
    },
    {
      name: "not-to-dev-dep",
      severity: "error",
      comment:
        "This module depends on an npm package from the 'devDependencies' section of your " +
        "package.json. It looks like something that ships to production, though. To prevent problems " +
        "with npm packages that aren't there on production declare it (only!) in the 'dependencies'" +
        "section of your package.json. If this module is development only - add it to the " +
        "from.pathNot re of the not-to-dev-dep rule in the dependency-cruiser configuration",
      from: {
        path: "^(src)",
        pathNot: "\\.(spec|test)\\.(js|mjs|cjs|ts|ls|coffee|litcoffee|coffee\\.md)$",
      },
      to: {
        dependencyTypes: ["npm-dev"],
      },
    },
    {
      name: "optional-deps-used",
      severity: "info",
      comment:
        "This module depends on an npm package that is declared as an optional dependency " +
        "in your package.json. As this makes sense in limited situations only, it's flagged here. " +
        "If you're using an optional dependency here by design - add an exception to your" +
        "depdency-cruiser configuration.",
      from: {},
      to: {
        dependencyTypes: ["npm-optional"],
      },
    },
    {
      name: "peer-deps-used",
      comment:
        "This module depends on an npm package that is declared as a peer dependency " +
        "in your package.json. This makes sense if your package is e.g. a plugin, but in " +
        "other cases - maybe not so much. If the use of a peer dependency is intentional " +
        "add an exception to your dependency-cruiser configuration.",
      severity: "error",
      from: {},
      to: {
        dependencyTypes: ["npm-peer"],
      },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
      dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer", "npm-bundled", "npm-no-pkg"],
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: "tsconfig.json",
    },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
    reporterOptions: {
      dot: {
        collapsePattern: "node_modules/[^/]+",
      },
      archi: {
        collapsePattern: "^(packages|src|lib|app|bin|test(s?)|spec(s?))/[^/]+|node_modules/[^/]+",
      },
    },
  },
};
