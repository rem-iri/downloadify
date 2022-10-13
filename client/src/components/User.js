import { Box, Heading, Highlight, Text } from '@chakra-ui/react'
import React from 'react'

const User = ({ user }) => {

    return (
        <>
            <Box>
                <Text fontWeight="thin" fontSize="4rem">Hello, 
                    <a href={user?.external_urls?.spotify}>
                        <Text as="span" fontWeight="700" fontSize="4rem">
                            <Highlight 
                                query={user?.display_name} 
                                styles={{ px: '2', py: '1', rounded: 'full', bg: 'pink.500' }}
                            >{`${user?.display_name}.`}
                            </Highlight>
                        </Text>
                    </a>
                </Text>
            </Box>
        </>
    )
}

export default User