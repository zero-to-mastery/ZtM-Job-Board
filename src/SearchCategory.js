import React from 'react';

const SearchCategory = ({categoryChange}) => {
  return(
    <div className="dn db-l SearchCategory relative ma0 pa0 fr">
      <div className="radio-box pa0 di">
        <input type="radio" name="category" value="location" onChange={categoryChange}/> Location
      </div>
      <div className="radio-box pa0 di">
        <input type="radio" name="category" value="name" defaultChecked onChange={categoryChange}/> Name
      </div>
      <div className="radio-box pa0 di">
        <input type="radio" name="category" value="job title" onChange={categoryChange}/> Job Title
      </div>
    </div>
  )
}

export default SearchCategory;
