import ora from "ora";
import fs from "fs";
import {
  parseDate,
  generateMarkdownRaking,
  sanatizeResults,
} from "./utils/index.js";
import { fetchContributionsByUsername } from "./services/github.js";
import { ENVS } from "./config/index.js";

const spinner = ora();
const USERS = JSON.parse(fs.readFileSync("users.json", "utf-8"));

const fetchUsersData = async () => {
  const results = [];
  for (const [index, user] of USERS.entries()) {
    const start = Date.now();
    const res = await fetchContributionsByUsername(user);
    const duration = Date.now() - start;
    spinner.text = `${index}. ${user.padEnd(20)} - ${
      res.total
    } contributtions (${duration} ms)`;
    results.push(res);
  }
  return results;
};

const configSpinner = () => {
  spinner.text = `Fetching contributions for ${USERS.length} users...`;
  spinner.color = "yellow";
};

async function main() {
  const fromFormatted = parseDate(ENVS.FROM);
  const toFormatted = parseDate(ENVS.TO);

  configSpinner();

  spinner.start();
  const results = await fetchUsersData();
  spinner.stop();

  console.log("\n✅ All contributions fetched successfully!");

  const sorted = sanatizeResults(results);

  console.log(
    `\n🏆 Contributions ranking (${fromFormatted} to ${toFormatted}):`
  );

  sorted.forEach((u, i) => {
    console.log(`${i + 1}. ${u.username.padEnd(20)} - ${u.total}`);
  });

  generateMarkdownRaking(fromFormatted, toFormatted, sorted);
}

main();
