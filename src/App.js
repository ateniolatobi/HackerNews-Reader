import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import axios from "axios";
import { sortBy } from "lodash";
import PropTypes from "prop-types";
import classnames from "classnames";
const DEFAULT_QUERY = "redux";
const PATH_BASE = "https://hn.algolia.com/api/v1";
const PATH_SEARCH = "/search";
const PARAM_SEARCH = "query=";
const PARAM_PAGE = "page=";

const largeColumn = {
  width: "40%"
};
const midColumn = {
  width: "30%"
};
const smallColumn = {
  width: "10%"
};

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, "title"),
  AUTHOR: list => sortBy(list, "author"),
  COMMENTS: list => sortBy(list, "num_comments").reverse(),
  POINTS: list => sortBy(list, "points").reverse()
};

const updateSearchTopStoryState = result => prevState => {
  const { hits, page } = result;
  const { list, key } = prevState;
  const oldHit = list && list[key] ? list[key].hits : [];

  const updateHits = [...oldHit, ...hits];
  console.log("Search is ", key);
  return {
    list: { ...list, [key]: { hits: updateHits, page } },
    isLoading: false
  };
};
// console.log("not in shit " + SORTS["NONE"]);

const isSearched = searchTerm => item =>
  item.title.toLowerCase().includes(searchTerm.toLowerCase());

class Search extends Component {
  componentDidMount() {
    if (this.input) {
      this.input.focus();
    }
  }

  render() {
    const { search, searchText, children, onSubmit } = this.props;

    return (
      <form onSubmit={onSubmit}>
        {" "}
        {children}{" "}
        <input
          type="text"
          value={search}
          onChange={searchText}
          onSubmit={event => event.preventDefault()}
          ref={node => {
            this.input = node;
          }}
        />{" "}
        <button> Submit</button>
      </form>
    );
  }
}

const Loading = () => <div>Loading...</div>;

const SORT = ({ onSort, children, sortKey, activeSortKey }) => {
  console.log("SORT sortkey is ", sortKey);
  const sortClass = classnames("button-inline", {
    "button-active": activeSortKey === sortKey
  });
  // console.log("sortCLass is ", sortClass.join(" "));
  return (
    <Button className={sortClass} onClick={() => onSort(sortKey)}>
      {children}
    </Button>
  );
};
class BookList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortkey: "NONE",
      isSortReverse: false
    };
    this.onSort = this.onSort.bind(this);
  }

  onSort(key) {
    // console.log("ONsoRT SORT KEY IS ", sortkey);
    // console.log("sortkey is ", this.state.sortkey);
    const { sortkey, isSortReverse } = this.state;
    const Reverse = sortkey === key && !isSortReverse;
    this.setState({ sortkey: key, isSortReverse: Reverse });
  }
  render() {
    const { list, onDismiss } = this.props;
    const { sortkey, isSortReverse } = this.state;
    const new_list = SORTS[sortkey](list);
    // console.log("is sortreverse is " + isSortReverse);
    const reverseList = isSortReverse ? new_list.reverse() : new_list;
    // console.log("onsort here is ", this.onSort);
    console.log("THe active sortkey is ", sortkey);
    return (
      <div className="table">
        <div className="sort-options">
          <SORT onSort={this.onSort} sortKey="NONE" activeSortKey={sortkey}>
            Originial Form
          </SORT>
          <SORT onSort={this.onSort} sortKey="TITLE" activeSortKey={sortkey}>
            Sort by Title
          </SORT>
          <SORT onSort={this.onSort} sortKey="AUTHOR" activeSortKey={sortkey}>
            Sort by author
          </SORT>

          <SORT sortKey="COMMENTS" onSort={this.onSort} activeSortKey={sortkey}>
            Sort by comments
          </SORT>
          <SORT sortKey="POINTS" onSort={this.onSort} activeSortKey={sortkey}>
            Sort by points
          </SORT>
        </div>
        {reverseList.map(item => {
          return (
            <div key={item.objectID} className="table-row">
              <span style={largeColumn}>
                <a href={item.url}>{item.title}</a>
              </span>
              <span style={midColumn}>{item.author}</span>
              <span style={smallColumn}>{item.date}</span>
              <span>
                <Button onClick={() => onDismiss(item.objectID)}>
                  Dismiss
                </Button>
              </span>
            </div>
          );
        })}
      </div>
    );
  }
}

const Button = ({ onClick, children, className }) => {
  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
};

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

const withLoading = Component => ({ isLoading, ...rest }) =>
  isLoading ? <Loading /> : <Component {...rest} />;

const ButtonWithLoading = withLoading(Button);

Button.defaultProps = {
  className: ""
};

BookList.propTypes = {
  list: PropTypes.array.isRequired,
  onDismiss: PropTypes.func.isRequired
};

class App extends Component {
  constructor(props) {
    super(props);
    const search = DEFAULT_QUERY;
    const list = null;
    this.state = {
      list,
      search,
      key: "",
      error: null,
      willUnmount: false,
      isLoading: false,
      sortKey: "NONE",
      isSortReverse: false
    };
    this.searchText = this.searchText.bind(this);
    this.setsearchTopStories = this.setsearchTopStories.bind(this);
    this.needsToSearchTopResults = this.needsToSearchTopResults.bind(this);
    this.fetchTopStories = this.fetchTopStories.bind(this);
    this.dismiss = this.dismiss.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  // onSort(sortKey) {
  //   const isSortReverse = this.state.sortKey === sortKey && !this.isSortReverse;
  //   this.setState({ sortKey, isSortReverse });
  // }

  searchText(event) {
    this.setState({ search: event.target.value });
  }

  needsToSearchTopResults(key) {
    const { list } = this.state;
    return !list[key];
  }

  dismiss(i) {
    alert(i);
    const { key, list } = this.state;
    const { hits, page } = this.state.list[key];
    const new_hits = hits.filter(item => {
      return item.objectID !== i;
    });
    this.setState({
      list: { ...list, [key]: { hits: new_hits, page } }
    });
  }

  render() {
    const { search, list, key, error, isLoading } = this.state;
    const page = (list && list[key] && list[key].page) || 0;
    const hit_list = (list && list[key] && list[key].hits) || [];
    return (
      <div className="page">
        <div className="interactions">
          <Search
            search={search}
            searchText={event => {
              this.searchText(event);
            }}
            onSubmit={this.onSubmit}
          >
            Type to Search
          </Search>
        </div>
        {!error ? (
          <BookList list={hit_list} onDismiss={id => this.dismiss(id)} />
        ) : (
          <div className="interactions">
            <p>Something went wrong.</p>
          </div>
        )}
        <div className="interactions">
          <ButtonWithLoading
            onClick={() => {
              this.fetchTopStories(this.state.key, page + 1);
            }}
            isLoading={isLoading}
          >
            More...
          </ButtonWithLoading>
        </div>
      </div>
    );
  }

  onSubmit(event) {
    const { search, key } = this.state;
    this.setState({ key: search });
    if (this.needsToSearchTopResults(search)) {
      console.log("Triggered");
      this.fetchTopStories(search);
    }
    event.preventDefault();
  }

  fetchTopStories(searchTerm, page = 0) {
    // console.log("search term is ", searchTerm);
    // alert("Awio");
    this.setState({ isLoading: true });
    axios(
      `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`
    )
      .then(
        result => !this.willUnmount && this.setsearchTopStories(result.data)
      )
      .catch(error => !this.willUnmount && this.setState({ error }));
  }

  setsearchTopStories(result) {
    this.setState(updateSearchTopStoryState(result));
    // this.setState(prevState => {
    //   const { hits, page } = result;
    //   const { list, key } = prevState;
    //   const oldHit = list && list[key] ? list[key].hits : [];

    //   const updateHits = [...oldHit, ...hits];
    //   console.log("Search is ", key);
    //   return {
    //     list: { ...list, [key]: { hits: updateHits, page } },
    //     isLoading: false
    //   };
    // });
  }

  componentDidMount() {
    this.willUnmount = false;
    const { search } = this.state;
    this.setState({ key: search });
    this.fetchTopStories(search);
  }

  componentWillUnmount() {
    this.setState({ willUnmount: true });
  }
}

export default App;

export { Search, BookList, Button };
