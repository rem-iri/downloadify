import React, { useEffect, useRef, useState } from 'react'
import { Box, Center, HStack, Image, Text, keyframes, Button, Wrap } from '@chakra-ui/react';
import { handleError } from '../utils/error-handler';
import { MdOutlineDownloadForOffline, MdOutlineDownloading } from 'react-icons/md';

const Song = ({ data }) => {
    const [isPlayed, setIsPlayed] = useState(false);
    const [songFilename, setSongFilename] = useState(null);

    const playerRef = useRef();

    const [isLoading, setIsLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const getSong = async () => {
            setIsLoading(true);
            let response = await fetch(data.downloadUrl);
            handleError(response);
            let text = await response.text();

            setSongFilename(text);
            setIsLoading(false);
        }
        if (isPlayed) {
            getSong();
        }

    }, [isPlayed])

    let throb = keyframes`
        0% {opacity: 1;}
        100% {opacity: 0;}`;

    return (
        <>
            <HStack m="1rem">
                <Box
                    pos="relative"
                    w="3rem"
                    h="3rem"
                    minW="3rem"
                    minH="3rem"
                    onMouseOver={() => {
                        setIsHovered(true);
                    }}
                    onMouseOut={() => {
                        setIsHovered(false);
                    }}
                >
                    <Image
                        cursor="pointer"
                        boxSize="100%"
                        src={data.track?.album?.images?.[data.track?.album?.images?.length - 1 || 0]?.url}
                    />
                    <Center
                        pos="absolute"
                        top={0}
                        left={0}
                        w="100%"
                        h="100%"
                        visibility={isLoading ? "visible" : (isHovered ? "visible" : "hidden")}
                    >
                        {
                            songFilename ?
                                (<></>) :
                                (isLoading ?
                                    (<Center m={0} p={0} animation={`${throb} infinite 1s linear alternate`}>
                                        <MdOutlineDownloading size="80%" />
                                    </Center>
                                    ) :
                                    (<MdOutlineDownloadForOffline
                                        size="80%"
                                        onClick={() => {
                                            setIsPlayed(true);
                                        }}
                                    />)
                                )
                        }
                    </Center>
                </Box>
                <Box textAlign="left">
                    <Text fontWeight="bold">{data?.track?.name}</Text>
                    <Text color="gray.400">{data?.track?.artists?.map(a => a.name).join(", ")}</Text>
                </Box>

            </HStack>
            {songFilename ?
                <Wrap m="1rem" mb="2rem">
                    <Box w="100%" maxWidth="300px">
                        <audio
                            ref={playerRef}
                            controls="controls"
                            src={`/track/${songFilename}`}
                            style={{ height: "30px", width: "100%" }}
                            controlsList="nodownload noplaybackrate"
                        />
                    </Box>
                    <Button variant='ghost' onClick={() => {
                        fetch(`/track/${songFilename}`)
                            .then(response => response.blob())
                            .then(blob => {
                                var url = window.URL.createObjectURL(blob);
                                var a = document.createElement('a');
                                a.href = url;
                                a.download = songFilename;
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                            });
                    }}>Download</Button>
                </Wrap>
                :
                <></>
            }
        </>
    )
}

export default Song