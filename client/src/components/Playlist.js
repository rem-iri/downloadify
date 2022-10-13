import { AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box } from '@chakra-ui/react'
import React from 'react'
import Song from './Song'

const Playlist = ({ data }) => {
    return (
        <>
            <AccordionItem>
                <h2>
                    <AccordionButton>
                        <Box flex='1' textAlign='left'>
                            {data.name}
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                    {data?.tracks?.items?.map((song, index) => {
                        return <Song key={`${data?.id}${song?.track?.id || index}`} data={song} />
                    })}
                </AccordionPanel>
            </AccordionItem>
        </>
    )
}

export default Playlist