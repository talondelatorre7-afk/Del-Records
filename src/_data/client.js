module.exports = {
    name: "Summit Records",
    email: "talondelatorre7@gmail.com",
    phoneForTel: "909-919-0912",
    phoneFormatted: "(909) 919-0912",
    socials: {
        facebook: "https://www.facebook.com/log00001",
        instagram: "https://www.instagram.com/thesummitrecords",
    },
    //! Make sure you include the file protocol (e.g. https://) and that NO TRAILING SLASH is included
    domain: "https://www.example.com",
    // Passing the isProduction variable for use in HTML templates
    isProduction: process.env.ELEVENTY_ENV === "PROD",
};
