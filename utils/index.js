import fs from "fs";

export const parseDate = (date) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const generateMarkdownRaking = (fromFormatted, toFormatted, sorted) => {
  const lines = [
    "# 🏆 Contributions Ranking",
    `**From:** ${fromFormatted}`,
    `**To:** ${toFormatted}`,
    "",
    "| Rank | User             | Total |",
    "|------|------------------|-------|",
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

  fs.writeFileSync("ranking.md", lines.join("\n"), "utf-8");
  console.log("\n📄 File 'ranking.md' generated successfully!");
};

export const sanatizeResults = (results) =>
  results.filter((u) => u.total > 0).sort((a, b) => b.total - a.total);
