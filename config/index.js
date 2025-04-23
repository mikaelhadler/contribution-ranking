import dotenv from "dotenv";
dotenv.config();

const TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_HOST = process.env.GITHUB_HOST;
const FROM = process.env.FROM;
const TO = process.env.TO;
const GRAPHQL_URL = `https://${GITHUB_HOST}`;

export const ENVS = {
  FROM,
  TO,
  TOKEN,
  GITHUB_HOST,
  GRAPHQL_URL,
};
