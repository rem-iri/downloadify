import React, { useEffect, useState } from 'react';
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Heading } from '@chakra-ui/react'
import { StoreContext } from "./../utils/store.js";
import User from './User';
import Playlist from './Playlist.js';
import Song from './Song.js';
import { handleError } from '../utils/error-handler.js';

const Home = () => {
    const {
        accessToken: [accessToken, setAccessToken],
        refreshToken: [refreshToken, setRefreshToken],
        error: [error, setError],
    } = React.useContext(StoreContext);

    const [user, setUser] = useState({});
    const [saved, setSaved] = useState([]);
    const [playlists, setPlaylists] = useState([]);

    const generateDownloadUrl = (artist, trackName) => {
        return `http://localhost:${process.env.REACT_APP_PORT}/download?artist=${encodeURIComponent(artist)}&trackName=${encodeURIComponent(trackName)}`;
    }

    const fetchRefreshToken = async () => {
        let request = await fetch(`/refresh_token?${new URLSearchParams({
            refresh_token: refreshToken,
        })}`
        );
        let json = await request.json();
        setAccessToken(json.access_token);
    }

    useEffect(() => {
        let playlistIdPile = [];

        getUser().catch(error => { console.log(`Error fetching user: ${error}`) });
        collectPlaylists();
        collectSaved();

        async function getUser() {
            let request = await fetch("https://api.spotify.com/v1/me", { headers: { "Authorization": `Bearer ${accessToken}` } });
            let json = await request.json();

            setUser(json);
        }
        
        async function getUserPlaylists(offset = 0, limit = 50) {
            let request = await fetch(`https://api.spotify.com/v1/me/playlists?offset=${offset}&limit=${limit}`, { headers: { "Authorization": `Bearer ${accessToken}` } });
            if (request.status === 401) {
                await fetchRefreshToken();
                collectPlaylists();
                return;
            }
            handleError(request);

            let json = await request.json();
            if (json.next) {
                getUserPlaylists(offset + 50, limit);
            }

            json?.items?.forEach(playlist => {
                playlistIdPile.push(playlist.id)
            })
        }

        async function getPlaylists(playlistIds) {
            let playlists = [];
            await Promise.allSettled(playlistIds?.map(async id => {
                let request = await fetch(`https://api.spotify.com/v1/playlists/${id}`, { headers: { "Authorization": `Bearer ${accessToken}` } });
                handleError(request);

                let json = await request.json();

                json?.tracks?.items.forEach(t => {
                    let artist = t.track.artists.map(a => a.name).join(" ");
                    let trackName = t.track.name;

                    t.downloadUrl = generateDownloadUrl(artist, trackName);
                })

                playlists.push(json);
            }))

            setPlaylists(prev => playlists);
        }

        async function collectPlaylists() {
            await getUserPlaylists();
            getPlaylists(playlistIdPile);
        }

        async function getUserSaved(offset = 0, limit = 50, data = []) {
            let request = await fetch(`https://api.spotify.com/v1/me/tracks?offset=${offset}&limit=${limit}`, { headers: { "Authorization": `Bearer ${accessToken}` } })
            handleError(request);

            let json = await request.json();
            json?.items.forEach(t => {
                let artist = t.track.artists.map(a => a.name).join(" ");
                let trackName = t.track.name;

                t.downloadUrl = generateDownloadUrl(artist, trackName);
            })

            if (json.next) {
                return await getUserSaved(offset + 50, limit, [...data, ...json?.items]);
            }
            else {
                return [...data, ...json?.items]
            }
        }

        async function collectSaved() {
            let saved = await getUserSaved();
            setSaved(prev => saved);
        }
    }, [])

    return (
        <Box>
            {Object.keys(user).length !== 0 ? <User user={user}/> : <></>}
            <Heading fontWeight="bold" my="1em" fontSize="1.5rem">Your Playlists</Heading>
            <Accordion allowMultiple>
                {saved?.length == 0 ?
                    <></> :
                    <>
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box flex='1' textAlign='left'>
                                        Saved ❤️
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                {saved?.map((song, index) => {
                                    return (
                                        <Song key={`${song?.track?.id || index}`} data={song} />
                                    )
                                })}
                            </AccordionPanel>
                        </AccordionItem>
                    </>
                }
                {playlists?.map(playlist => {
                    return (
                        <Playlist key={playlist.id} data={playlist} />
                    )
                })}
            </Accordion>
        </Box>
    )
}

export default Home;