import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import PostUpvoter from './PostUpvoter'

const POSTS_PER_PAGE = 10

// The data prop, which is provided by the HOC below contains
// a `loading` key while the query is in flight and posts when it is ready
function PostList (props) {
  const { data: { allPosts, loading, _allPostsMeta }, loadMorePosts } = props
  if (loading) {
    return <div>Loading</div>
  }

  let button
  if (allPosts.length < _allPostsMeta.count) {
    button = <button onClick={() => loadMorePosts()}>Show More</button>
  }

  return (
    <section>
      <ul>
        {allPosts.map((post, index) =>
          <li key={post.id}>
            <div>
              <span>{index + 1}. </span>
              <a href={post.url}>{post.title}</a>
              <PostUpvoter id={post.id} votes={post.votes} />
            </div>
          </li>
        )}
      </ul>
      {button}
      <style jsx>{`
        li {
          display: block;
          margin-bottom: 10px;
        }
        div {
          align-items: center;
          display: flex;
        }
        a {
          font-size: 14px;
          margin-right: 10px;
          text-decoration: none;
          padding-bottom: 0;
          border: 0;
        }
        span {
          font-size: 14px;
          margin-right: 5px;
        }
        ul {
          margin: 0;
          padding: 0;
        }
        button {
          align-items: center;
          display: flex;
        }
        button:before {
          border-color: #fff transparent transparent transparent;
          border-style: solid;
          border-width: 6px 4px 0 4px;
          content: "";
          height: 0;
          margin-right: 5px;
          width: 0;
        }
      `}</style>
    </section>
  )
}

const allPosts = gql`
  query allPosts($first: Int!, $skip: Int!) {
    allPosts(orderBy: votes_DESC, first: $first, skip: $skip) {
      id
      title
      votes
      url
    },
    _allPostsMeta {
      count
    }
  }
`

// The `graphql` wrapper executes a GraphQL query and makes the results
// available on the `data` prop of the wrapped component (PostList here)
export default graphql(allPosts, {
  options: (ownProps) => ({
    variables: {
      skip: 0,
      first: POSTS_PER_PAGE
    }
  }),
  props: ({ data }) => ({
    data,
    loadMorePosts: () => {
      return data.fetchMore({
        variables: {
          skip: data.allPosts.length
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult.data) {
            return previousResult
          }
          return Object.assign({}, previousResult, {
            // Append the new posts results to the old one
            allPosts: [...previousResult.allPosts, ...fetchMoreResult.data.allPosts]
          })
        }
      })
    }
  })
})(PostList)
