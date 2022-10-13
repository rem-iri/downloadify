import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, Container, Heading, Stack, Flex, Text, Center } from '@chakra-ui/react';
import './App.css';
import Home from './components/Home.js';
import Login from './components/Login.js';
import { useColorMode } from '@chakra-ui/react';
import { MdNightsStay, MdWbSunny } from 'react-icons/md';
import { StoreContext } from "./utils/store.js";

function App() {
	const { colorMode, toggleColorMode } = useColorMode()
	const {
		accessToken: [accessToken, setAccessToken],
		refreshToken: [refreshToken, setRefreshToken],
		error: [error, setError],
	} = React.useContext(StoreContext);

	const [code, setCode] = useState(null),
		[sessionState, setSessionState] = useState(null);

	useEffect(() => {
		function getHashParams() {
			let hashParams = {};
			let e, r = /([^&;=]+)=?([^&;]*)/g,
				q = window.location.hash.substring(1);
			while (e = r.exec(q)) {
				hashParams[e[1]] = decodeURIComponent(e[2]);
			}
			return hashParams;
		}

		function getSearchParams() {
			let searchParams = {};
			let fragment = new URLSearchParams(window.location.search);
			for (let item of fragment) {
				searchParams[item[0]] = item[1];
			}
			return searchParams;
		}

		let hashParams = getHashParams();
		let searchParams = getSearchParams();

		setAccessToken(hashParams.access_token);
		setRefreshToken(hashParams.refresh_token);
		setError(hashParams.error);

		setCode(searchParams.code)
		setSessionState(searchParams.state);
	}, [])

	useEffect(() => {
		if (code && sessionState) {
			let params = new URLSearchParams();

			params.append("code", code);
			params.append("state", sessionState);
			fetch(`/callback?${params.toString()}`)
				.then(res => res.text())
				.then(url => {
					window.location.href = url;
				});
		}
	})
	return (
		<>
			<Flex justifyContent="space-between" alignItems="center" height="80px">
				<Flex justifyContent="space-between" alignItems="center">
					<Heading
						fontWeight="700"
						fontSize="2rem"
						bgGradient='linear(to-l, #7928CA, #FF0080)'
						bgClip="text"
						m="2rem"
					>
						Downloadify
					</Heading>
				</Flex>

				<Flex justifyContent="space-between" alignItems="center">
					<Button
						onClick={toggleColorMode}
						fontWeight="700"
						m="2rem"
					>
						{colorMode === 'light' ? <MdNightsStay /> : <MdWbSunny />}
					</Button>
				</Flex>
			</Flex>

			<Box px="2rem">
				{accessToken && refreshToken ?
					<Home /> :
					<Flex
						height="40vh"
						flexDirection="column"
						justifyContent="center"
						alignItems="center"
					>
						<Box m="1rem"><Heading size="md">Save songs from your spotify playlist! Login to get started.</Heading></Box>
						<Login />
					</Flex>}
			</Box>
		</>
	);
}

export default App;