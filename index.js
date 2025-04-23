import fs from 'fs';
import dotenv from 'dotenv';
import ora from 'ora';
import { parseDate } from './utils/index.js'

dotenv.config();

const USERS = JSON.parse(fs.readFileSync('users.json', 'utf-8'));
const FROM = process.env.FROM;
const TO = process.env.TO;
const spinner = ora();

const fetchUsersData = async () => {
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
  return results
}

const configSpinner = () => {
  spinner.text = `Fetching contributions for ${USERS.length} users...`;
  spinner.color = 'yellow';
}

const sanatizeResults = (results) => results
  .filter((u) => u.total > 0)
  .sort((a, b) => b.total - a.total)

const generateMarkdownRaking = (sorted) => {
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
async function main() {
  const fromFormatted = parseDate(FROM);
  const toFormatted = parseDate(TO);
  
  configSpinner();

  spinner.start();
  const results = await fetchUsersData();
  spinner.stop();
  
  console.log('\n✅ All contributions fetched successfully!');

  const { sorted } = sanatizeResults(results);

  console.log(
    `\n🏆 Contributions ranking (${fromFormatted} to ${toFormatted}):`
  );

  sorted.forEach((u, i) => {
    console.log(`${i + 1}. ${u.username.padEnd(20)} - ${u.total}`);
  });

  generateMarkdownRaking(sorted);
}

main();
