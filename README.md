# Downloadify
Save songs from your Spotify playlist. This makes use of `youtube-dlp` under the hood to match and download songs.

### Pre-requisites
1. You need to generate your own `CLIENT_ID` and `CLIENT_SECRET`. Follow this guide to set-up up your [Spotify Developer Account](https://developer.spotify.com/documentation/web-api/quick-start/#set-up-your-account).
1. Add the callback value through Spotify Developer Dashboard `http:localhost:<PORT>/callback`. Default port is `8099`
1. Create an `.env` file following the `.env.example` format and fill your `CLIENT_ID` and `CLIENT_SECRET` values.

### Running
1. `node server` to start the express server.
1. `cd client && npm run start` to start the React App

![Screenshot 2022-10-14 040801](https://user-images.githubusercontent.com/37006040/195706410-674cb054-da3a-4c68-9ca8-d85053bfa750.png)
![downloadify-sample4](https://user-images.githubusercontent.com/37006040/195706420-d96e1180-1137-4b65-89d2-82c6fcffd612.png)
