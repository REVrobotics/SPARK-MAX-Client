// Copy this file and rename it either to "proto-gen.secret.js" or "proto-gen.secret.json".
// Fill it according to the comments here below.
// Either "username" and "password" or just "token" field should be specified

module.exports = {
  download: {
    auth: {
      // Name of the user which has read access to the target repository
      "username": "bruce-wayne",
      // Password of the specified user
      "password": "unbreakable-password",
      // To generate token read this help article
      // https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line
      // Note! Token should have "repo" scope assigned to access private repository
      "token": "1111223445677"
    }
  },
};
