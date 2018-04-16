import React from 'react';
import './SearchCategory.css'
const SearchCategory = ({categoryChange}) =>{
    return(
        <div className="SearchCategory">
            <div className="ratio-box">
                Categories: 
            </div>
            <div className="ratio-box">
                <input type="radio" name="category" value="location" onChange={categoryChange}/> Location  
            </div>
            <div className="ratio-box">
                <input type="radio" name="category" value="name" onChange={categoryChange}/> Name
            </div>
            <div className="ratio-box">
                <input type="radio" name="category" value="job title" onChange={categoryChange}/> Job Title
            </div> 
        </div>
    )
}

export default SearchCategory;