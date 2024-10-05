import { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { IssueModal } from "./IssueModal";

const GET_REPOSITORY_ISSUES = gql`
  query GetRepositoryIssues(
    $owner: String!
    $repoName: String!
    $first: Int
    $after: String
    $before: String
    $last: Int
  ) {
    repository(owner: $owner, name: $repoName) {
      issues(
        first: $first
        after: $after
        before: $before
        last: $last
        states: OPEN
      ) {
        totalCount
        edges {
          node {
            title
            createdAt
            author {
              login
            }
          }
        }
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

export const IssueList = ({
  owner,
  repoName,
  selectedRepoId,
}: {
  owner: string;
  repoName: string;
  selectedRepoId: string;
}) => {
  const [isModalOpen, setModalOpen] = useState(false);

  const { data, loading, fetchMore, refetch } = useQuery(
    GET_REPOSITORY_ISSUES,
    {
      variables: { owner, repoName, first: 6, after: null },
      notifyOnNetworkStatusChange: true,
    }
  );

  useEffect(() => {
    refetch();
  }, [isModalOpen, refetch]);

  const loadMore = (direction: "next" | "prev") => {
    if (direction === "next" && data.repository.issues.pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          first: 6,
          after: data.repository.issues.pageInfo.endCursor,
          before: null,
          last: null,
        },
      });
    } else if (
      direction === "prev" &&
      data.repository.issues.pageInfo.hasPreviousPage
    ) {
      fetchMore({
        variables: {
          last: 6,
          before: data.repository.issues.pageInfo.startCursor,
          after: null,
          first: null,
        },
      });
    }
  };

  if (loading && !data) return <p>Loading...</p>;

  return (
    <div className="flex flex-col gap-2 w-full items-center p-5 bg-gray-800 rounded-md">
      <div className="flex justify-between w-full items-center">
        <h2>Open Issues ({data?.repository?.issues?.totalCount ?? 0})</h2>
        <button
          className=" text-white py-2 px-4 rounded-md "
          onClick={() => setModalOpen(true)}
        >
          New Issue
        </button>
      </div>

      <ul className="flex flex-col gap-2 w-full p-5">
        {data?.repository?.issues?.edges.map((issue: any, index: number) => (
          <li
            key={`${issue?.node?.title}_${index}`}
            className="mb-2 text-white"
          >
            {issue?.node?.title} -{" "}
            {new Date(issue?.node?.createdAt).toDateString()} by{" "}
            {issue?.node?.author?.login}
          </li>
        ))}
      </ul>

      <div>
        {data?.repository?.issues?.pageInfo?.hasPreviousPage && (
          <button
            className="bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600"
            onClick={() => loadMore("prev")}
          >
            Previous
          </button>
        )}
        {data?.repository?.issues?.pageInfo?.hasNextPage && (
          <button
            className="ml-4 bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600"
            onClick={() => loadMore("next")}
          >
            Next
          </button>
        )}
      </div>

      {isModalOpen && (
        <IssueModal setModalOpen={setModalOpen} repositoryId={selectedRepoId} />
      )}
    </div>
  );
};
