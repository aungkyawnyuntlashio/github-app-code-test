import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";

const CREATE_ISSUE = gql`
  mutation CreateIssue($repositoryId: ID!, $title: String!, $body: String) {
    createIssue(
      input: { repositoryId: $repositoryId, title: $title, body: $body }
    ) {
      issue {
        id
        title
      }
    }
  }
`;

export const IssueModal = ({
  repositoryId,
  setModalOpen,
}: {
  repositoryId: string;
  setModalOpen: (value: boolean) => void;
}) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [createIssue, { loading, error }] = useMutation(CREATE_ISSUE, {
    onCompleted: () => {
      setModalOpen(false);
    },
    onError: (error) => {
      console.error("Error creating issue:", error);
    },
  });

  const handleSubmit = async () => {
    if (!title) {
      alert("Title is required");
      return; 
    }
    
    await createIssue({ variables: { repositoryId, title, body } });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-gray-600 p-6 rounded-md shadow-lg w-96">
        <h3 className="text-lg font-bold mb-4">New Issue</h3>
        <input
          type="text"
          placeholder="Issue Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border mb-4 p-2 rounded-md"
        />
        <textarea
          placeholder="Description"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full border mb-4 p-2 rounded-md"
        />
        <div className="flex justify-between">
          <button
            className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={loading} // Disable button while loading
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
        {error && <p className="text-red-500 mt-2">{error.message}</p>}
      </div>
    </div>
  );
};
