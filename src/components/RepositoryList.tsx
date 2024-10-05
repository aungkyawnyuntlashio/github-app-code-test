import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { IssueList } from './IssueList'; 

const GET_REPOS = gql`
  query GetRepos($login: String!, $first: Int, $last: Int, $after: String, $before: String) {
    user(login: $login) {
      repositories(first: $first, last: $last, after: $after, before: $before) {
        edges {
          node {
            id
            name
            description
            stargazerCount
            watchers {
              totalCount
            }
          }
        }
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
          startCursor
        }
      }
    }
  }
`;

export const RepositoryList = ({ login }: { login: string }) => {
  const [pageState, setPageState] = useState({
    first: 5,
    after: null as string | null,
    before: null as string | null,
    currentPage: 1,
  });

  const { data, loading, fetchMore } = useQuery(GET_REPOS, {
    variables: { login, first: 5 },
    notifyOnNetworkStatusChange: true,
  });
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);

  const totalRepos = data?.user?.repositories.totalCount || 0;
  const reposPerPage = 5;
  const totalPages = Math.ceil(totalRepos / reposPerPage);

  const handleRepoClick = (repoName: string, repoId: string) => {
    console.log(`Repository clicked: ${repoName}`);
    setSelectedRepo(repoName);
    setSelectedRepoId(repoId);
  };


  const loadMore = (direction: 'next' | 'prev') => {
    if (direction === 'next' && data.user.repositories.pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          first: reposPerPage,
          after: data.user.repositories.pageInfo.endCursor,
          before: null,
          last: null,
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prevResult;
          return {
            user: {
              repositories: {
                ...fetchMoreResult.user.repositories,
                edges: [
                  ...fetchMoreResult.user.repositories.edges,
                ],
              },
            },
          };
        },
      }).then(() => {
        setPageState((prevState) => ({
          ...prevState,
          first: reposPerPage,
          after: data.user.repositories.pageInfo.endCursor,
          before: null,
          currentPage: prevState.currentPage + 1,
        }));
      });
    } else if (direction === 'prev' && data.user.repositories.pageInfo.hasPreviousPage) {
      fetchMore({
        variables: {
          last: reposPerPage,
          before: data.user.repositories.pageInfo.startCursor,
          after: null,
          first: null,
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prevResult;
          return {
            user: {
              repositories: {
                ...fetchMoreResult.user.repositories,
                edges: [
                  ...fetchMoreResult.user.repositories.edges,
                ],
              },
            },
          };
        },
      }).then(() => {
        setPageState((prevState) => ({
          ...prevState,
          first: null as unknown as number,
          after: null,
          before: data.user.repositories.pageInfo.startCursor,
          last: reposPerPage,
          currentPage: prevState.currentPage - 1,
        }));
      });
    }
  };

  if (loading && !data) return <p>Loading...</p>;

  return (
    <div className='flex flex-col gap-2 w-full items-center p-5  bg-gray-900 '>
      <h3 className='w-full font-bold underline'>{login}'s Repositories ({totalRepos})</h3>
      <ul className='flex flex-col gap-2 w-full p-5'>
        {data.user.repositories.edges.map((repo: any) => (
          <li key={repo.node.id} className='hover:bg-gray-800 cursor-pointer p-2' onClick={() => handleRepoClick(repo.node.name, repo.node.id)}>
            {repo.node.name} - {repo.node.stargazerCount} stars / {repo.node.watchers.totalCount} watching
          </li>
        ))}
      </ul>

      <div className='flex flex-row w-full justify-center items-center gap-2'>
        <p>Page {pageState.currentPage} of {totalPages}</p>
        {data.user.repositories.pageInfo.hasPreviousPage && (
          <button onClick={() => loadMore('prev')}>Previous</button>
        )}
        {data.user.repositories.pageInfo.hasNextPage && (
          <button onClick={() => loadMore('next')}>Next</button>
        )}
      </div>

      {selectedRepo && selectedRepoId && <IssueList owner={login} repoName={selectedRepo} selectedRepoId={selectedRepoId}/>}
    </div>
  );
};
