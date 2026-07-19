module.exports = {
    name: "DEL Records",
    email: "info@delrecords.com",
    phoneForTel: "909-919-0912",
    phoneFormatted: "(909) 919-0912",
    socials: {
        facebook: "https://www.facebook.com/delrecords",
        instagram: "https://www.instagram.com/delrecords",
    },
    //! Make sure you include the file protocol (e.g. https://) and that NO TRAILING SLASH is included
    domain: "https://www.delrecords.com",
    // Passing the isProduction variable for use in HTML templates
    isProduction: process.env.ELEVENTY_ENV === "PROD",
};
