const http = require('http');


function verifyCaptchaAns(captchaId, captchaAns) {
    const data = JSON.stringify({
        id: captchaId,
        answer: captchaAns
    });

    const options = {
        ip: 'http://140.238.206.232',
        path: '/captcha/v2/answer',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            console.log(`statusCode: ${res.statusCode}`);
            res.setEncoding('utf8');
            if (res.statusCode != 200) {
                reject(`http status ${res.statusCode} error`);
            } else {

                let responseBody = '';

                res.on('data', (chunk) => {
                    responseBody += chunk;
                });

                res.on('end', () => {
                    console.log(data);
                    console.log('Body: ', JSON.parse(data));
                    resolve(JSON.parse(responseBody));
                });
            }


        });

        req.on('error', (err) => {
            console.log("Error: ", err.message);
            reject(err);
        });

        req.write(data)
        req.end();
    });
}


async function verifyHuman(req, res, next) {
    const { captchaAns, captchaId } = req.body;

    console.log(req.body);

    if (!captchaAns) {
        console.log('Please answer Captcha!');
        return res.status(400).json({ message: 'No Captcha answer provided' });
    }

    if (!captchaId) {
        console.log('Please provide captcha id');
        return res.status(400).json({ message: 'No Captcha id provided' });
    }

    let verified = null;
    try {
        verified = await verifyCaptchaAns(captchaId, captchaAns);
        console.log(verified);

    } catch (error) {
        console.log(`Caught http error: ${error}`);
        return res.status(502).json({ message: 'Internal server error processing Captcha' });
    }

    if (verified.result) {
        switch (verified.result) {
            case 'True':
                console.log('Correct Captcha answer')
                return next();
            // break;
            case 'False':
                console.log('Invalid Captcha answer')
                return res.status(400).json({ message: 'Invalid Captcha answer' });
            // break;

            // Case where no captchaId or invalid or actually old provided
            case 'Expired':
                console.log('Captcha has expired');
                return res.status(401).json({ message: 'Captcha has expired' });
            // break;
            default:
                console.log('Internal server error processing Captcha');
                return res.status(503).json({ message: 'Internal server error processing Captcha' });
        }
    } else {
        console.log('Internal server error processing Captcha');
        return res.status(503).json({ message: 'Could not reach Captcha server error' });
    }

}

module.exports = {
    verifyHuman: verifyHuman
};