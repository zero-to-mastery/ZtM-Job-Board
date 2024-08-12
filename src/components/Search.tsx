import React from 'react'
import SearchBox from './SearchBox'

const Search = ({ onSearchChange, responsiveSearch }: any) => {
    return (
        <div className="search-area">
            <SearchBox
                responsiveSearch={responsiveSearch}
                searchChange={onSearchChange}
            />
        </div>
    )
}

export default Search
