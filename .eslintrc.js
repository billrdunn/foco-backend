module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    jest: true
  },
  extends: ["airbnb", "prettier"],
  plugins: ["prettier"],
  rules: {
    "no-console": 0,
  },
};
