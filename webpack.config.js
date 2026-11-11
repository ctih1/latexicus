const path = require("path");

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: {
        main: "./src/main.ts"
    },
    output: {
        path: path.resolve(__dirname, "./build"),
        filename: "content-bundle.js"
    },
    resolve: {
        extensions: [".ts", ".js"]
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
