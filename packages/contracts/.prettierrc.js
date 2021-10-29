module.exports = {
  overrides: [
    {
      files: "*.sol",
      options: {
        printWidth: 120,
        tabWidth: 4,
        singleQuote: false,
        explicitTypes: "always",
      },
    },
  ],
  plugins: [require.resolve("prettier-plugin-solidity")],
};
