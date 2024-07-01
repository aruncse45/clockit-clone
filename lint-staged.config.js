module.exports = {
  // this will check Typescript files
  "src/**/*.(ts|tsx)": () => "yarn tsc --noEmit",

  // This will lint and format TypeScript and                                             //JavaScript files
  "src/**/*.(ts|tsx|js)": () => [`yarn lint`, `yarn prettier --write .`],

  // this will Format MarkDown and JSON
  "**/*.(md|json)": (filenames) =>
    `yarn prettier --write ${filenames.join(" ")}`,
};
