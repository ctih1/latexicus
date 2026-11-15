const path = require("path");

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    watch: process.env.npm_config_watch || false,
    entry: {
        main: "./src/popup.ts"
    },
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "popup-bundle.js"
    },
    resolve: {
        extensions: [".ts", ".js", ".json"]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: "ts-loader",
                    options: {
                        configFile: "tsconfig.json",
                        transpileOnly: true
                    }
                }
            }
        ]
    }
};
