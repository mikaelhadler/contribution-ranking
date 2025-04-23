import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';
import ora from 'ora';

dotenv.config();

const TOKEN = process.env.GITHUB_TOKEN;
const HOST = process.env.GITHUB_HOST;
const GRAPHQL_URL = `https://${HOST}`;
const USERS = JSON.parse(fs.readFileSync('users.json', 'utf-8'));
const FROM = process.env.FROM;
const TO = process.env.TO;
const spinner = ora(`Fetching contributions for ${USERS.length} users...`);

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

async function main() {
  const fromFormatted = new Date(FROM).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const toFormatted = new Date(TO).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  spinner.start();
  spinner.color = 'yellow';

  const results = [];

  for (const [index, user] of USERS.entries()) {
    const start = Date.now();
    const res = await fetchContributions(user);
    const duration = Date.now() - start;
    spinner.text = `${index}. ${user.padEnd(20)} - ${
      res.total
    } contributtions (${duration} ms)`;
    results.push(res);
  }

  spinner.stop();
  console.log('\n✅ All contributions fetched successfully!');

  const validResults = results.filter((u) => u.total > 0);
  const sorted = validResults.sort((a, b) => b.total - a.total);

  console.log(
    `\n🏆 Contributions ranking (${fromFormatted} to ${toFormatted}):`
  );

  sorted.forEach((u, i) => {
    console.log(`${i + 1}. ${u.username.padEnd(20)} - ${u.total}`);
  });

  const lines = [
    '# 🏆 Contributions Ranking',
    `**From:** ${fromFormatted}`,
    `**To:** ${toFormatted}`,
    '',
    '| Rank | User             | Total |',
    '|------|------------------|-------|',
  ];

  let rank = 1;
  for (const user of sorted) {
    lines.push(
      `| ${rank.toString().padEnd(4)} | ${user.username.padEnd(
        16
      )} | ${user.total.toString().padStart(5)} |`
    );
    rank++;
  }

  fs.writeFileSync('ranking.md', lines.join('\n'), 'utf-8');
  console.log("\n📄 File 'ranking.md' generated successfully!");
}

main();
