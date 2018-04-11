import React from 'react';

const Card = ({name, website, jobTitle, location, id})=> {
	
return(

	<div className='tc bg-white grow w5  br3 pa3 ma4  bw2 shadow-5'>
	 { id ?  id  : <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://cdn3.iconfinder.com/data/icons/pictofoundry-pro-vector-set/512/Avatar-128.png` }/> }
		

		<div>

			<h2>{name}</h2>
			<div className=" grow ">{website}</div>
			<div>{jobTitle}</div>
			<p>{location}</p>


		</div>

	</div>

);
}

export default Card;