import React, { createContext, useContext, useEffect, useState } from "react"; 

export const StoreContext = createContext(null);

export default ({children}) => {
    const [accessToken, setAccessToken] = useState(null);
	const [refreshToken, setRefreshToken] = useState(null);
	const [error, setError] = useState(null);

    useEffect(() => {
        if(!accessToken || !refreshToken) {
            return;
        }
        let params = new URLSearchParams();
        params.append("access_token", accessToken);
        params.append("refresh_token", refreshToken);
        params.append("error", error);

        window.location = `/#${params.toString()}`;
    })

    const store = {
        accessToken: [accessToken, setAccessToken],
        refreshToken: [refreshToken, setRefreshToken],
        error: [error, setError],
    }

    return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}