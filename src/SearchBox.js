import React from 'react';

const SearchBox = ({searchChange, searchCategory} )=> {
	return(
		<div className ="pa2" id='searchbox'>
			<input
				className='tc pa3 ba b--green bg-white'
				type="search"
				placeholder={`Filter by ${searchCategory}.`} 
				onChange ={searchChange}
			/>
		</div>

		);
}

export default SearchBox;