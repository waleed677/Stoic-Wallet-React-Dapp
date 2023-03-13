import React from 'react'
import { Circles } from 'react-loader-spinner'

function Loader() {
    return (

        <div className="overlay">
            <div className="spinner">
            <Circles
            height="80"
            width="80"
            color="#4fa94d"
            ariaLabel="circles-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
        />
            </div>
        </div>
        
    )
}

export default Loader