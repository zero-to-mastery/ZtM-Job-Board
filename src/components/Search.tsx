import React from 'react'
import SearchBox from './SearchBox'

interface SearchProps {
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    responsiveSearch?: React.CSSProperties
    value: string
}

const Search = ({ onSearchChange, responsiveSearch, value }: SearchProps) => {
    return (
        <div className="search-area flex flex-wrap items-center ml4 mt1 z-1">
            <SearchBox
                responsiveSearch={responsiveSearch}
                searchChange={onSearchChange}
                value={value}
            />
        </div>
    )
}

export default Search
