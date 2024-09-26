module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "custom-green": "#636b2f", // Add your custom color
      },
      backgroundImage: {
        "custom-vertical-gradient":
          "linear-gradient(to bottom, #636b2f, #ffffff)", // Vertical gradient
      },
    },
  },
  plugins: [],
};
