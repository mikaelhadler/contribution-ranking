import axios from 'axios';
dotenv.config();

const TOKEN = process.env.GITHUB_TOKEN;
const GRAPHQL_URL = `https://${HOST}`;

const headers = {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  };
  
  const query = (username) => `
    query {
      user(login: "${username}") {
        contributionsCollection(from: "${FROM}", to: "${TO}") {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
        }
      }
    }
  `;
  
  async function fetchContributions(username) {
    try {
      const response = await axios.post(
        GRAPHQL_URL,
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
  