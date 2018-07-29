import React, {Component} from 'react';
import CardList from './components/CardList';
import Navbar from './components/Navbar';
import {persons} from './components/persons';

class App extends Component {
  constructor() {
    super()
    this.state = {
      persons: persons,
      searchfield: '',
      category: 'name',
      isMenuOpen: false,
    }
  }

  onSearchChange = (event) => {
    this.setState({searchfield:event.target.value});
  }

  onCategoryChange = (event) =>{
    this.setState({
      category:event.target.value,
      searchfield:''
    });
    let searchInput = document.querySelector('#searchbox input'); 
    searchInput.value = '';
    searchInput.focus();
  }

  toggleMenu = () => {
    this.setState(this.state.isMenuOpen ? {isMenuOpen:false} : {isMenuOpen:true});
    document.querySelector('.menu-icon').classList.toggle('change');
    document.querySelector('.header-items').classList.toggle('expand');
    document.querySelector('.collapse').classList.toggle('hidden');  
  }

  onKeyPress = (event) => {
    if ((event.keyCode === 13 || event.charCode === 13) && (this.state.isMenuOpen)) {
      event.currentTarget.blur();
      this.toggleMenu();
    }
  }

  whichCategory = (person) => {
    const category = this.state.category;
    if (category === 'location') {
      const location = `${person.location.city} ${person.location.state} ${person.location.country}`;
      return location.toLowerCase();
    }
    else if (category === 'name') {
      return person.name.toLowerCase();
    }
    else if (category === 'job title') {
      return person.jobTitle.toLowerCase();
    }
    else {
      return null;
    }
  }
  render() {
    const filteredPersons = this.state.persons.filter(persons => {
      const category = this.whichCategory(persons);
      if (category !== undefined) {
        return category.includes(this.state.searchfield.toLowerCase());
      }
      else {
        return null;
      }
    });
    return (
      <div className="flex flex-column min-vh-100 tc">
        <header className="custom--unselectable fixed top-0 w-100 white custom--bg-additional3 custom--shadow-4 z-3">
          
          <Navbar
            onSearchChange={this.onSearchChange}
            toggleMenu={this.toggleMenu}
            category={this.state.category}
            keyPress={this.onKeyPress}
            categoryChange={this.onCategoryChange}
          />

        </header>
        <main className="flex-auto">
          
          <CardList 
            persons={filteredPersons} 
          />

        </main>
        <footer className="custom--unselectable w-100 h3 flex items-center justify-center justify-end-l white custom--bg-additional3 z-2">
          <a href="https://github.com/zero-to-mastery/ZtM-Job-Board" title="Repository">
            <svg className="repo w2 h2" viewBox="0 0 12 16" version="1.1" aria-hidden="true">
              <path fillRule="evenodd" d="M4 9H3V8h1v1zm0-3H3v1h1V6zm0-2H3v1h1V4zm0-2H3v1h1V2zm8-1v12c0 .55-.45 1-1 1H6v2l-1.5-1.5L3 16v-2H1c-.55 0-1-.45-1-1V1c0-.55.45-1 1-1h10c.55 0 1 .45 1 1zm-1 10H1v2h2v-1h3v1h5v-2zm0-10H2v9h9V1z"></path>
            </svg>
          </a>
        </footer>
      </div>
    );
  }
}

export default App;
