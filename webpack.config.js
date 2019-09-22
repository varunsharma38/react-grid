const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    module: {
        rules: [
            {
                test: /\.(js|jsx)?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
				test: /\.(css|scss)$/,
				use: [
					'style-loader',
					'css-loader',
					'sass-loader'
				]
            },
            {
				test: /\.(jpg|jpeg|png|svg|gif)$/,
				use: [
					{
						loader: 'url-loader',
						options: { limit: 40000 }
						/*
						>40000 bytes -- separate file is created
						<40000 bytes -- image is converted to base64 and added to bundle.js
						*/
					},
					'image-webpack-loader'
				]	
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: [
					'file-loader'
				]
			},
            {
                test: /\.html$/,
                use: {
                    loader: 'html-loader'
                }
            }
        ]
    },
    plugins: [
        new HTMLWebpackPlugin({
            title: 'Getting Started',
            template: './index.html',
            filename: 'index.html'
        })
    ],
    devtool: 'source-map'
}