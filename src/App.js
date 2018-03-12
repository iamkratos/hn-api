import React, { Component } from 'react';
import './App.css';

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '100';

const PATH_BASE = 'http://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = '?query=';
const PARAM_PAGE = '&page=';
const PARAM_HPP = '&hitsPerPage=';
const FETCH_URL = `${PATH_BASE}${PATH_SEARCH}${PARAM_SEARCH}${DEFAULT_QUERY}${PARAM_PAGE}`;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY
    };
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({
      searchKey: searchTerm
    });
    this.fetchTopStories(searchTerm);
  }

  setSearchTopStories = result => {
    const { hits, page } = result;
    const { searchKey, results } = this.state;

    const oldHits =
      results && results[searchKey] ? results[searchKey].hits : [];

    const updatedHits = [...oldHits, ...hits];
    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      }
    });
  };

  onDismiss = id => {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];
    const isNotId = item => {
      return item.objectID !== id;
    };

    const updatedHits = hits.filter(isNotId);

    this.setState({
      results: { ...results, [searchKey]: { hits: updatedHits } }
    });
  };

  onSearchChange = event => {
    this.setState({
      searchTerm: event.target.value
    });
  };

  onSearchSubmit = e => {
    e.preventDefault();
    const { searchTerm } = this.state;
    this.setState({
      searchKey: searchTerm
    });

    if (this.needToSearchTopStories(searchTerm)) {
      this.fetchTopStories(searchTerm);
    }
  };

  fetchTopStories = (searchTerm, page = 0) => {
    console.log(
      `${PATH_BASE}${PATH_SEARCH}${PARAM_SEARCH}${searchTerm}${PARAM_PAGE}${page}${PARAM_HPP}${DEFAULT_HPP}`
    );
    fetch(
      `${PATH_BASE}${PATH_SEARCH}${PARAM_SEARCH}${searchTerm}${PARAM_PAGE}${page}${PARAM_HPP}${DEFAULT_HPP}`
    )
      .then(response => response.json())
      .then(result => {
        this.setSearchTopStories(result);
      })
      .catch(error => console.log(error));
  };

  needToSearchTopStories = searchTerm => {
    return !this.state.results[searchTerm];
  };

  render() {
    const { searchTerm, results, searchKey } = this.state;
    console.log(results);
    const page =
      (results && results[searchKey] && results[searchKey].page) || 0;
    const list =
      (results && results[searchKey] && results[searchKey].hits) || [];

    return (
      <div className="page">
        <div className="interactions">
          <Search
            searchTerm={searchTerm}
            onSearchChange={this.onSearchChange}
            onSearchSubmit={this.onSearchSubmit}
          >
            Search{' '}
          </Search>
        </div>

        <Table onDismiss={this.onDismiss} list={list} />

        <div className="interactions">
          <Button onClick={() => this.fetchTopStories(searchKey, page + 1)}>
            More
          </Button>
        </div>
      </div>
    );
  }
}

const Search = ({ searchTerm, onSearchChange, children, onSearchSubmit }) => {
  return (
    <form onSubmit={onSearchSubmit}>
      <h1>{children}</h1>
      <input value={searchTerm} onChange={onSearchChange} type="text" />
      <button type="submit">Search</button>
    </form>
  );
};

const Table = ({ list, onDismiss }) => {
  return (
    <div className="table">
      {list.map(item => {
        return (
          <div key={item.objectID} className="table-row">
            <span style={{ width: '40%' }}>
              <a href={item.url}>{item.title}</a>
            </span>
            <span style={{ width: '30%' }}>{item.author}</span>
            <span style={{ width: '10%' }}>{item.num_comments}</span>
            <span style={{ width: '10%' }}>{item.points}</span>
            <span style={{ width: '10%' }}>
              <Button
                onClick={() => onDismiss(item.objectID)}
                className="button-inline"
              >
                Dismiss
              </Button>
            </span>
          </div>
        );
      })}
    </div>
  );
};

class Button extends Component {
  render() {
    const { onClick, className = '', children } = this.props;
    return (
      <button onClick={onClick} className={className}>
        {children}
      </button>
    );
  }
}

export default App;
