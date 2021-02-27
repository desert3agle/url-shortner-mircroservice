const Url = require('../models/Url');
const dns = require('dns');

exports.createShortUrl = async (req, res) => {
    try {

        if (!req.body.url) return res.status(400).send('BAD REQUEST');

        let input_url = req.body.url;
        let responseObject = {};

        /**
         * @description      validation test
         * 
         */
        let urlRegex = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi);
        if (!input_url.match(urlRegex)) return res.status(400).json({ error: 'invalid url' });



        /**
         * @description      duplication check
         */

        const exists = await Url.findOne({ original_url: req.body.url });
        if (exists) return res.status(200).json(exists);


        /**
         * @method           getrandom()
         * @description      genrate random string
         */

        function getrandom() {
            const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let random_string = "";
            for (let i = 0; i < 6; i++) {
                random_string += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return random_string;
        }
        const short_url = getrandom();


        /**
         * @description     create new record
         */

        const newUrl = new Url({
            original_url: input_url,
            short_url: short_url
        });
        const savedData = await newUrl.save();

        responseObject['original_url'] = savedData.original_url;
        responseObject['short_url'] = savedData.short_url;

        res.status(201).json(responseObject);
    } catch (err) {
        res
            .status(err.status || 500)
            .type("txt")
            .send(err.message || "SERVER ERROR");
    }
}


exports.redirectToUrl = async (req, res) => {
    try {
        const response = await Url.findOne({ short_url: req.params.url });
        if (!response) return res.status(404).json({ error: 'NOT FOUND' });
        res.status(302).redirect(response.original_url);

    } catch (err) {
        res
            .status(err.status || 500)
            .type("txt")
            .send(err.message || "SERVER ERROR");// research more on error handaling
    }
}









