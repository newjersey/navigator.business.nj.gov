import path from "node:path";
import slsw from "serverless-webpack";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import nodeExternals from "webpack-node-externals";

/*
This line is only required if you are specifying `TS_NODE_PROJECT` for whatever reason.
 */
// delete process.env.TS_NODE_PROJECT;

export default {
  context: __dirname,
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  entry: slsw.lib.entries,
  devtool: slsw.lib.webpack.isLocal ? "eval-cheap-module-source-map" : "source-map",
  resolve: {
    extensions: [".mjs", ".json", ".ts"],
    symlinks: false,
    cacheWithContext: false,
    plugins: [
      new TsconfigPathsPlugin({
        configFile: "./tsconfig.paths.json",
      }),
    ],
  },
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, ".webpack"),
    filename: "[name].js",
  },
  optimization: {
    concatenateModules: false,
  },
  target: "node",
  externals: [
    nodeExternals(),
    nodeExternals({
      modulesDir: path.resolve(__dirname, "../node_modules"),
    }),
  ],
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.(tsx?)$/,
        loader: "ts-loader",
        exclude: [
          [
            path.resolve(__dirname, "node_modules"),
            path.resolve(__dirname, ".serverless"),
            path.resolve(__dirname, ".webpack"),
          ],
        ],
        options: {
          transpileOnly: true,
          experimentalWatchApi: true,
        },
      },
    ],
  },
  plugins: [],
};
