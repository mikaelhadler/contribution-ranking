import axios from "axios";
import { ENVS } from "../config/index.js";

const headers = {
  Authorization: `Bearer ${ENVS.TOKEN}`,
  "Content-Type": "application/json",
};

const query = (username) => `
    query {
      user(login: "${username}") {
        contributionsCollection(from: "${ENVS.FROM}", to: "${ENVS.TO}") {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
        }
      }
    }
  `;

export async function fetchContributionsByUsername(username) {
  try {
    const response = await axios.post(
      ENVS.GRAPHQL_URL,
      { query: query(username) },
      { headers }
    );

    const data = response.data?.data?.user?.contributionsCollection;

    if (!data) {
      console.warn(`⚠️ No data found for user: ${username}`);
      return { username, total: 0 };
    }

    const total =
      data.totalCommitContributions +
      data.totalIssueContributions +
      data.totalPullRequestContributions +
      data.totalPullRequestReviewContributions;

    return { username, total };
  } catch (error) {
    console.error(
      `❌ Failed to fetch ${username}:`,
      error?.response?.data || error.message
    );
    return { username, total: 0 };
  }
}
