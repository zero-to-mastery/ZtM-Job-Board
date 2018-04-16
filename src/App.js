import React, {Component} from 'react';
import CardList from './CardList';
import SearchBox from './SearchBox';
import { robots } from './robots';
import Scroll from './Scroll';
import SearchCategory from './SearchCategory';

class App extends Component {
	constructor() {
		super()
		this.state = {
			robots: robots,
			searchfield: "",
			category:"location",
			}
		}	
	
	onSearchChange = (event) => {
		this.setState({searchfield:event.target.value});
	}
	onCategoryChange = (event) =>{
		this.setState({category:event.target.value})
	}
	whichCategory = (robot) => {
		const category = this.state.category;
		if(category === 'location'){
			return robot.location.toLowerCase();
		}
		else if(category === 'name'){
			return robot.name.toLowerCase();
		}
		else if(category === 'job title'){
			return robot.jobTitle.toLowerCase();
		}	
	} 
	render() {
		const filteredRobots = this.state.robots.filter(robots => {
			const category = this.whichCategory(robots)
			return category.includes(this.state.searchfield.toLowerCase())
		});
		return (
			<div className='tc'>
				<h1 className ="baskerville i fw9 f1 underline ">Job Board </h1>
				<SearchBox searchChange={this.onSearchChange} searchCategory={this.state.category}/>
				<SearchCategory categoryChange={this.onCategoryChange}/>
				<Scroll>
						<CardList robots={filteredRobots} />
				</Scroll>
			</div>

		);
   }
}

export default App;