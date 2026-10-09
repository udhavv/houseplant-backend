// export default {
//   testEnvironment: "node",
//   clearMocks: true,
// };

// import {defineConfig} from "jest";

// export default defineConfig({
//   testEnvironment: "node",
//   clearMocks: true,
// });



const config= () => {
  return{
    testEnvironment: "node",
    clearMocks: true,
    verbose: true,
  }
};

export default config;