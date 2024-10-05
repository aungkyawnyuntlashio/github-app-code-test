import React, { useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { RepositoryList } from './RepositoryList';

const SEARCH_USERS = gql`
  query SearchUsers($query: String!) {
    search(query: $query, type: USER, first: 10) {
      edges {
        node {
          ... on User {
            login
            avatarUrl
            repositories(first: 10) {
              totalCount
              nodes {
                name
              }
            }
          }
        }
      }
    }
  }
`;

export const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchUsers, { data, loading }] = useLazyQuery(SEARCH_USERS);
  const [selectedUser, setSelectedUser] = useState('');

  const handleSearch = () => {
    searchUsers({ variables: { query: searchTerm } });
  };

  const handleUserClick = (login: string) => {
    console.log(`User clicked: ${login}`);
    setSelectedUser(login);
  };

  return (
    <div className='flex flex-col gap-2 w-screen h-screen items-center p-5 '>
      <div className='flex h-10 w-1/2 items-center justify-center'>
        <input
          type="text"
          className='w-1/2 p-2 border border-gray-300 rounded-md mr-2'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search GitHub Users"
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {loading && <p>Loading...</p>}
      <div className='flex w-full flex-col items-center mt-2'>
        <h3 className='w-full'>Users</h3>
        {data && (
          <ul className='flex gap-4 w-full justify-center flex-wrap mt-4'>
            {data.search.edges.map((user: any, index: number) => (
              <li key={`${user.node.login}_${index}`} className='flex flex-col gap-3 w-30 justify-center items-center cursor-pointer' onClick={()=>handleUserClick(user.node.login)}>
                <img src={user.node.avatarUrl} alt={user.node.login} className='w-20 h-20 rounded-full' />
                <span className='w-full flex-wrap text-wrap text-center'>{user.node.login}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className='w-full'>
        {selectedUser && selectedUser !== '' && <RepositoryList login={selectedUser} />}
      </div>
    </div>
  );
};
