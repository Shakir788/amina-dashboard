const axios = require('axios');

async function sendWhatsAppMessage(
    to,
    message
) {

    try {

        await axios({
            method: 'POST',

            url:
`https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`,

            headers: {
                Authorization:
`Bearer ${process.env.META_ACCESS_TOKEN}`,

                'Content-Type':
'application/json'
            },

            data: {
                messaging_product:
'whatsapp',

                to: to,

                text: {
                    body: message
                }
            }
        });

    } catch (error) {

        console.log(
            '❌ WhatsApp Send Error'
        );

        console.log(
            error.response?.data ||
            error.message
        );
    }
}

module.exports =
    sendWhatsAppMessage;