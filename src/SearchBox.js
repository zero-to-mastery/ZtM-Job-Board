import React from 'react';

const SearchBox = ({searchfield, searchChange} )=> {
	return(
		<div className ="pa2">
			<input
			className='tc pa3 ba b--green bg-white'
			 type="search"
			  placeholder='Filter by location.' 
			  onChange ={searchChange}
			  />
		</div>

		);
}

export default SearchBox;