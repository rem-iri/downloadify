const express = require('express');
const PORT = 3001;
const fetch = require("node-fetch");
const cors = require('cors');
const querystring = require('query-string');
const cookieParser = require('cookie-parser');
const fs = require('fs').promises;
const path = require('path');
const shelljs = require('shelljs');
const app = express();
const platform = process.platform;
const youtubeDlpWrap = require("yt-dlp-wrap").default;

require('dotenv').config({ path: __dirname + '/.env' });
let client_id = process.env['CLIENT_ID'];
let client_secret = process.env['CLIENT_SECRET'];
let redirect_uri = `http://localhost:${process.env.REACT_APP_PORT}/callback`;
let stateKey = 'spotify_auth_state';

checkYtDlpExist();

app.use(express.static(path.resolve(__dirname, './client/build')))
	.use(cors())
	.use(cookieParser());

app.get('/login', function (req, res) {
	let state = generateRandomString(16);
	res.cookie(stateKey, state);

	let scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative user-library-read';
	res.send('https://accounts.spotify.com/authorize?' +
		querystring.stringify({
			response_type: 'code',
			client_id: client_id,
			scope: scope,
			redirect_uri: redirect_uri,
			state: state
		}));
});

app.get('/callback', async function (req, res) {
	let code = req.query.code || null;
	let state = req.query.state || null;

	if (state === null) {
		console.log("state mismatch");
		res.redirect('/#' +
			querystring.stringify({
				error: 'state_mismatch'
			}));
	} else {
		res.clearCookie(stateKey);

		const form = new URLSearchParams();
		form.append("code", code);
		form.append("redirect_uri", redirect_uri);
		form.append("grant_type", "authorization_code");

		try {
			let response = await fetch('https://accounts.spotify.com/api/token', {
				method: "POST",
				headers: {
					'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')),
				},
				body: form,
			});

			if (response.status === 200) {
				let tokenResponse = await response.text();
				tokenResponse = JSON.parse(tokenResponse);
				console.log("BODY", tokenResponse);
				let access_token = tokenResponse.access_token,
					refresh_token = tokenResponse.refresh_token;

				console.log("Redirecting...");
				res.send('/#' +
					querystring.stringify({
						access_token: access_token,
						refresh_token: refresh_token
					}));
			}
		} catch (error) {
			console.log("ERROR", err)
			res.send('/#' +
				querystring.stringify({
					error: 'invalid_token'
				}));
		}
	}
});

app.get('/refresh_token', async function (req, res) {
	let refresh_token = req.query.refresh_token;
	let form = new URLSearchParams();
	form.append("grant_type", 'refresh_token');
	form.append("refresh_token", refresh_token);

	let response = await fetch('https://accounts.spotify.com/api/token', {
		method: "POST",
		headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
		body: form,
	})

	if (response.ok) {
		let json = await response.json()
		let access_token = json.access_token;
		console.log("my new acces token: ", access_token)
		res.json({
			'access_token': access_token
		});
	}
});

app.get("/download", async (req, res) => {
	let programPath = path.resolve(`./downloaded`);

	try {
		await fs.access(programPath);
	} catch (error) {
		await fs.mkdir(programPath);
	}

	let artist = req.query.artist;
	let trackName = req.query.trackName;
	let formattedQuery = `${artist} ${trackName}`.replace(/[\\/:*?"<>| ]/gi, '_').toLowerCase();
	console.log(`Downloading: ${formattedQuery}`);

	let trackExists = await checkFileExists(`./downloaded/${formattedQuery}.mp3`);
	if (!trackExists) {
		let script = `cd ${programPath} && ${platform == "win32" ? path.resolve("./yt-dl/yt-dlp.exe ") : path.resolve("./yt-dl/yt-dlp")} -f "ba" --extract-audio --audio-format mp3 --extractor-args "youtube:player_client=web_music" --match-filter "description*='Auto-generated'" --embed-metadata "https://music.youtube.com/search?q=${encodeURIComponent(artist)}%20${encodeURIComponent(trackName)}#songs" --max-downloads 1 -o "${formattedQuery}.mp3"`;
		console.log(script);
		let child = await shelljs.exec(script, { async: true, silent: true });

		child.stdout.on("data", data => {
			let finishedQuery = /Maximum number of downloads reached/g
			let finished = finishedQuery.test(data);

			finished ? res.send(`${formattedQuery}.mp3`) : null;
		})
	} else {
		res.send(`${formattedQuery}.mp3`);
	}
})

app.get("/track/:filename", async (req, res) => {
	let track = req.params.filename;
	console.log(`Saving: ${track}`)
	res.sendFile(path.resolve(`./downloaded/${track}`));
})

async function checkFileExists(filepath) {
	let tracksPath = path.resolve(filepath);
	try {
		await fs.access(tracksPath);
		return true;
	} catch (error) {
		return false;
	}
}

async function checkYtDlpExist() {
	let ytDlpExist = await checkFileExists(`./yt-dl/yt-dlp.exe`);
	if (ytDlpExist) return;

	youtubeDlpWrap.downloadFromGithub(path.resolve("./yt-dl/yt-dlp.exe"));
};

function generateRandomString(length) {
	let text = '';
	let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

console.log(`Listening on ${PORT}`);
app.listen(PORT);