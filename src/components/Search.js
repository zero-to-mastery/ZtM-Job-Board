import React from 'react';
import SearchBox from './SearchBox';

const Search = ({ onSearchChange, keyPress, responsiveSearch }) => {
  return (
    <div className="search-area flex flex-wrap items-center ml4 mt1 z-1">
      <SearchBox
        responsiveSearch={responsiveSearch}
        searchChange={onSearchChange}
        keyPress={keyPress}
      />
    </div>
  );
};

export default Search;
