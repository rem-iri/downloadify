import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider } from '@chakra-ui/react';
import { ColorModeScript } from '@chakra-ui/react';
import Fonts from './fonts'
import theme from './theme';

import StoreProvider from './utils/store';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<>
		<StoreProvider>
			<ChakraProvider theme={theme}>
				<ColorModeScript initialColorMode={theme.config.initialColorMode} />
				<Fonts/>
				<App/>
			</ChakraProvider>
		</StoreProvider>
	</>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
