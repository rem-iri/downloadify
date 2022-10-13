import React, { useEffect, useState } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { handleError } from '../utils/error-handler';

const Login = () => {
    let [spotify_url, setSpotifyUrl] = useState(null);

    useEffect(() => {
        const getSpotifyRedirect = async function () {
            let response = await fetch("/login");
            handleError(response);
            let text = await response.text();

            setSpotifyUrl(text);
        }

        getSpotifyRedirect()
    }, [])

    return (
        <Box>
            {spotify_url ?
                <>
                    <Button colorScheme="green" variant="outline" onClick={() => {
                        window.location.href = spotify_url;
                    }}>Login to Spotify</Button>
                </> :
                <></>
            }
        </Box>
    )
}

export default Login;